import { IconButton } from "./button";
import { ErrorBoundary } from "./error";

import styles from "./mask.module.scss";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";
import EyeIcon from "../icons/eye.svg";
import CopyIcon from "../icons/copy.svg";
import Mdelete from "../icons/mdelete.png";
import Medit from "../icons/medit.png";
import Madd from "../icons/madd.png";

import { DEFAULT_MASK_AVATAR, Mask, useMaskStore } from "../store/mask";
import {
  ChatMessage,
  ModelConfig,
  useAppConfig,
  useChatStore,
  newRole,
} from "../store";
import { ROLES } from "../client/api";
import { Input, List, ListItem, Modal, Popover, Select } from "./meet-ui-lib";
import { Avatar, AvatarPicker } from "./emoji";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "../locales";
import { useNavigate } from "react-router-dom";

import chatStyle from "./chat.module.scss";
import { useEffect, useState } from "react";
import { downloadAs, readFromFile } from "../utils";
import { Updater } from "../typing";
import { ModelConfigList } from "./model-config";
import { FileName, Path } from "../constant";
import { BUILTIN_MASK_STORE } from "../masks";
import { InputRange } from "./input-range";
import Image from "next/image";
import { showToast } from "./ui-lib";
export function MaskAvatar(props: { mask: Mask }) {
  return props.mask.avatar !== DEFAULT_MASK_AVATAR ? (
    <Avatar avatar={props.mask.avatar} />
  ) : (
    <Avatar model={props.mask.modelConfig.model} />
  );
}

export function MaskConfig(props: {
  isNew?: boolean;
  mask: Mask;
  updateMask: Updater<Mask>;
  extraListItems?: JSX.Element;
  readonly?: boolean;
  shouldSyncFromGlobal?: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const updateConfig = (updater: (config: ModelConfig) => void) => {
    if (props.readonly) return;

    const config = { ...props.mask.modelConfig };
    updater(config);
    props.updateMask((mask) => {
      mask.modelConfig = config;
      // if user changed current session mask, it will disable auto sync
      mask.syncGlobalConfig = false;
    });
  };

  const globalConfig = useAppConfig();
  // console.log('测试一下',props.mask)
  return (
    <>
      <ContextPrompts
        isNew={props.isNew}
        context={props.mask.context}
        rolearr={props.mask.newRole}
        updateContext={(updater) => {
          const context = props.mask.context.slice();
          updater(context);
          props.updateMask((mask) => (mask.context = context));
        }}
        updateRole={(updater) => {
          // console.log("更新测试", props);
          const newRole = props.mask.newRole?.slice();
          updater(newRole);
          props.updateMask((mask) => (mask.newRole = newRole));
        }}
        mask={props.mask}
        updateMask={props.updateMask}
      />

      {/* <List>
        {props.mask?.newRole?.length > 0 ? (
          <ListItem
            title={Locale.Mask.Role.name}
            subTitle={Locale.Mask.Role.SubTitle}
          >
            <InputRange
              title={props.mask.modelConfig.roleNumber.toString()}
              value={props.mask.modelConfig.roleNumber}
              min="1"
              max="4"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) => (config.roleNumber = e.target.valueAsNumber),
                )
              }
            ></InputRange>
          </ListItem>
        ) : null}
        <ListItem title={Locale.Mask.Config.Avatar}>
          <Popover
            content={
              <AvatarPicker
                onEmojiClick={(emoji) => {
                  props.updateMask((mask) => (mask.avatar = emoji));
                  setShowPicker(false);
                }}
              ></AvatarPicker>
            }
            open={showPicker}
            onClose={() => setShowPicker(false)}
          >
            <div
              onClick={() => setShowPicker(true)}
              style={{ cursor: "pointer" }}
            >
              <MaskAvatar mask={props.mask} />
            </div>
          </Popover>
        </ListItem>
        <ListItem title={Locale.Mask.Config.Name}>
          <input
            type="text"
            value={props.mask.name}
            onInput={(e) =>
              props.updateMask((mask) => {
                mask.name = e.currentTarget.value;
              })
            }
          ></input>
        </ListItem>
        <ListItem
          title={Locale.Mask.Config.HideContext.Title}
          subTitle={Locale.Mask.Config.HideContext.SubTitle}
        >
          <input
            type="checkbox"
            checked={props.mask.hideContext}
            onChange={(e) => {
              props.updateMask((mask) => {
                mask.hideContext = e.currentTarget.checked;
              });
            }}
          ></input>
        </ListItem>
        <ListItem
          title={Locale.Mask.Config.Journey.Title}
          subTitle={Locale.Mask.Config.Journey.SubTitle}
        >
          <input
            type="checkbox"
            checked={props.mask.isJourney}
            onChange={(e) => {
              props.updateMask((mask) => {
                mask.isJourney = e.currentTarget.checked;
                console.log("mask", mask);
              });
            }}
          ></input>
        </ListItem>
        {props.shouldSyncFromGlobal ? (
          <ListItem
            title={Locale.Mask.Config.Sync.Title}
            subTitle={Locale.Mask.Config.Sync.SubTitle}
          >
            <input
              type="checkbox"
              checked={props.mask.syncGlobalConfig}
              onChange={(e) => {
                if (
                  e.currentTarget.checked &&
                  confirm(Locale.Mask.Config.Sync.Confirm)
                ) {
                  props.updateMask((mask) => {
                    mask.syncGlobalConfig = e.currentTarget.checked;
                    mask.modelConfig = { ...globalConfig.modelConfig };
                  });
                }
              }}
            ></input>
          </ListItem>
        ) : null}
      </List>

      <List>
        <ModelConfigList
          modelConfig={{ ...props.mask.modelConfig }}
          updateConfig={updateConfig}
        />
        {props.extraListItems}
      </List> */}
    </>
  );
}

function ContextPromptItem(props: {
  prompt: ChatMessage;
  update: (prompt: ChatMessage) => void;
  remove: () => void;
  mask: Mask;
  updateMask: Updater<Mask>;
}) {
  const updateConfig = (updater: (config: ModelConfig) => void) => {
    const config = { ...props.mask.modelConfig };
    updater(config);
    props.updateMask((mask) => {
      mask.modelConfig = config;
      // if user changed current session mask, it will disable auto sync
      mask.syncGlobalConfig = false;
    });
  };
  console.log("测试", props);
  return (
    <div>
      <div className={chatStyle["meet-tit"]}>
        会议主题 <i>*</i>
      </div>
      <div className={chatStyle["context-prompt-row"]}>
        <Input
          value={props.prompt.content}
          type="text"
          className={chatStyle["context-content"]}
          placeholder="请输入会议主题"
          rows={1}
          onInput={(e) => {
            props.update({
              ...props.prompt,
              content: e.currentTarget.value as any,
            });
            props.updateMask((mask) => {
              mask.name = e.currentTarget.value;
            });
          }}
        />
      </div>

      <div className={chatStyle["meet-tit"]}>
        会议轮数 <i>*</i>
      </div>
      <div className={chatStyle["context-prompt-row"]}>
        <InputRange
          title={props.mask.modelConfig.roleNumber.toString()}
          value={props.mask.modelConfig.roleNumber}
          min="1"
          max="4"
          step="1"
          className={chatStyle["input-mrange"]}
          onChange={(e) =>
            updateConfig(
              (config) => (config.roleNumber = e.target.valueAsNumber),
            )
          }
        ></InputRange>
        {/* <Input
            value={props.prompt.content}
            type="number"
            className={chatStyle["context-content"]}
            placeholder="请输入会议轮数(此设置仅影响每个身份的发言次数)"
            rows={1}
            onInput={(e) =>
              props.update({
                ...props.prompt,
                content: e.currentTarget.value as any,
              })
            }
          /> */}
      </div>

      <div className={chatStyle["context-prompt-row"]}>
        <div className={chatStyle["meet-tit"]}>
          {" "}
          是否生成执行方案<i>*</i>
        </div>
        <input
          type="checkbox"
          checked={props.mask.programme}
          onChange={(e) => {
            props.updateMask((mask) => {
              mask.programme = e.currentTarget.checked;
            });
          }}
        ></input>
      </div>
    </div>
  );
}

export function ContextRoleItem(props: {
  prompt: newRole;
  update: (prompt: newRole) => void;
  remove: () => void;
  setShowMeet: (_: boolean) => void;
  setShowMeetadd: (_: boolean) => void;
  num: number;
  setEditNum: (_: number) => void;
}) {
  return (
    <div className={chatStyle["meet-peo-one"]}>
      {/* <List> */}
      <div>
        <div className={chatStyle["meet-peo-one-set"]}>
          <Image
            src={Mdelete.src}
            onClick={() => props.remove()}
            width={15}
            height={15}
            alt="删除"
            className={chatStyle["meet-peo-icon"]}
          />
          <Image
            src={Medit.src}
            onClick={() => {
              props.setShowMeet(true);
              props.setShowMeetadd(false);
              props.setEditNum(props.num);
            }}
            width={15}
            height={15}
            alt="编辑"
            className={chatStyle["meet-peo-icon"]}
          />
        </div>
        <div className={chatStyle["meet-peo-averter"]}>
          {props.prompt.content.slice(0, 1)}
        </div>

        <div className={chatStyle["meet-peo-nickname"]}>
          {props.prompt.content}
        </div>
      </div>

      {/* <ListItem title={Locale.Mask.Config.Name}>
          <input
            type="text"
            value={props.prompt.content}
            placeholder={Locale.Mask.Role.place}
            onInput={(e) =>
              props.update({
                ...props.prompt,
                content: e.currentTarget.value as any,
              })
            }
          ></input>
        </ListItem> */}
      {/* </List> */}
    </div>
  );
}
function AddMeetPeo(props: {
  isNew?: boolean;
  operatenum: number;
  prompt: object;
  rolearr: newRole[];
  setShowMeet: (_: boolean) => void;
  updateRole: (updater: (rolearr: newRole[]) => void) => void;
  // updateRole: (updater: (rolearr: newRole[]) => void) => void;
}) {
  let rolearr = props.rolearr;
  console.log("我的侧啊哈", props);
  const addContextRole = (prompt: newRole) => {
    // console.log('我的侧啊哈',prompt,rolearr,props)
    props.updateRole((rolearr) => rolearr.push(prompt));
  };
  const removeContextRole = (i: number) => {
    props.updateRole((rolearr) => rolearr.splice(i, 1));
  };
  const updateContextRole = (i: number, prompt: newRole) => {
    props.updateRole((rolearr) => (rolearr[i] = prompt));
    // console.log('输入的时候角色更新',props)
  };

  return (
    <div className="modal-mask">
      <Modal
        title="新建参会人"
        onClose={() => {
          if (props.isNew) {
            removeContextRole(rolearr.length - 1);
          }
          props.setShowMeet(false);
        }}
        actions={[
          <IconButton
            key="reset"
            bordered
            text="保存"
            onClick={() => {
              if (rolearr[props.operatenum].content == "")
                return showToast("请输入参会人岗位");
              props.setShowMeet(false);
            }}
          />,
        ]}
      >
        <div
          className={chatStyle["context-prompt"]}
          style={{ marginBottom: 20 }}
        >
          <div className={chatStyle["meet-tit"]}>
            参会人岗位 <i>*</i>
          </div>
          <div className={chatStyle["context-prompt-row"]}>
            <Input
              value={rolearr[props.operatenum].content}
              type="text"
              className={chatStyle["context-content"]}
              placeholder="请输入参会人岗位"
              maxLength={6}
              rows={1}
              onInput={
                (e) => {
                  rolearr[props.operatenum].content = e.currentTarget
                    .value as any;
                  // if(rolearr[props.operatenum].content.length<6){

                  updateContextRole(
                    props.operatenum,
                    rolearr[props.operatenum],
                  );
                  // }
                }
                // props.update({
                //   ...props.prompt,
                //   content: e.currentTarget.value as any,
                // })
              }
            />
          </div>

          <div className={chatStyle["meet-tit"]}>岗位描述 </div>
          <div className={chatStyle["context-prompt-row"]}>
            <Input
              value={rolearr[props.operatenum].date}
              type="number"
              className={chatStyle["context-content"]}
              placeholder="请输入岗位描述"
              rows={1}
              onInput={(e) => {
                rolearr[props.operatenum].date = e.currentTarget.value as any;
                updateContextRole(props.operatenum, rolearr[props.operatenum]);
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function ContextPrompts(props: {
  isNew?: boolean;
  context: ChatMessage[];
  updateContext: (updater: (context: ChatMessage[]) => void) => void;
  rolearr: newRole[];
  updateRole: (updater: (rolearr: newRole[]) => void) => void;
  mask: Mask;
  updateMask: Updater<Mask>;
}) {
  const updateConfig = (updater: (config: ModelConfig) => void) => {
    const config = { ...props.mask.modelConfig };
    updater(config);
    props.updateMask((mask) => {
      mask.modelConfig = config;
      // if user changed current session mask, it will disable auto sync
      mask.syncGlobalConfig = false;
    });
  };
  const [showMeet, setShowMeet] = useState(false);
  const [showMeetadd, setShowMeetadd] = useState(false);
  const [editNum, setEditNum] = useState(0);
  // console.log('qqqq我的侧啊哈',props)

  const context = props.context;
  const rolearr = props.rolearr;
  const addContextRole = (prompt: newRole) => {
    // console.log('我的侧啊哈',prompt,rolearr,props)
    props.updateRole((rolearr) => rolearr.push(prompt));
  };
  const removeContextRole = (i: number) => {
    props.updateRole((rolearr) => rolearr.splice(i, 1));
  };
  const updateContextRole = (i: number, prompt: newRole) => {
    props.updateRole((rolearr) => (rolearr[i] = prompt));
    // console.log('输入的时候角色更新',props)
  };

  const addContextPrompt = (prompt: ChatMessage) => {
    props.updateContext((context) => context.push(prompt));
  };

  const removeContextPrompt = (i: number) => {
    props.updateContext((context) => context.splice(i, 1));
  };

  const updateContextPrompt = (i: number, prompt: ChatMessage) => {
    console.log("ceshi");
    props.updateContext((context) => (context[i] = prompt));
  };
  return (
    <>
      <div className={chatStyle["context-prompt"]} style={{ marginBottom: 20 }}>
        {context.map((c, i) => (
          <ContextPromptItem
            key={i}
            prompt={c}
            update={(prompt) => updateContextPrompt(i, prompt)}
            remove={() => removeContextPrompt(i)}
            mask={props.mask}
            updateMask={props.updateMask}
          />
        ))}

        {/* <div className={chatStyle["context-prompt-row"]}>
          <IconButton
            icon={<AddIcon />}
            text={Locale.Context.Add}
            bordered
            className={chatStyle["context-prompt-button"]}
            onClick={() =>
              addContextPrompt({
                role: "user",
                content: "",
                date: "",
              })
            }
          />
        </div> */}
      </div>

      {/* 新增角色 */}

      <div className={chatStyle["context-prompt"]} style={{ marginBottom: 20 }}>
        <div className={chatStyle["meet-tit"]}>
          参会人信息 <i>*</i>
        </div>
        <div className={chatStyle["meet-peo"]}>
          {rolearr?.map((c, i) => (
            <ContextRoleItem
              key={i}
              prompt={c}
              update={(prompt) => updateContextRole(i, prompt)}
              remove={() => removeContextRole(i)}
              setShowMeet={setShowMeet}
              setShowMeetadd={setShowMeetadd}
              num={i}
              setEditNum={setEditNum}
            />
          ))}
          <div
            className={chatStyle["meet-peo-add"]}
            onClick={() => {
              addContextRole({
                role: "user",
                content: "",
                date: "",
              });
              setEditNum(rolearr.length);
              setShowMeet(true);
              setShowMeetadd(true);
            }}
          >
            <div>
              <div className={chatStyle["meet-peo-addcenter"]}>
                <Image src={Madd.src} width={30} height={30} alt="添加参会人" />
              </div>
              <div>添加参会人</div>
            </div>
          </div>

          {showMeet && (
            <AddMeetPeo
              prompt={{
                role: "user",
                content: "",
                date: "",
              }}
              operatenum={editNum}
              rolearr={rolearr}
              setShowMeet={setShowMeet}
              updateRole={props.updateRole}
              isNew={showMeetadd}
            ></AddMeetPeo>
          )}
        </div>

        {/* <IconButton
          icon={<AddIcon />}
          text={'添加参会人'}
          bordered
          className={chatStyle["context-prompt-button"]}
          onClick={() =>
            addContextRole({
              role: "user",
              content: "",
              date: "",
            })
          }
        /> */}
      </div>
    </>
  );
}

export function MaskPage() {
  const navigate = useNavigate();

  const maskStore = useMaskStore();
  const chatStore = useChatStore();

  const [filterLang, setFilterLang] = useState<Lang>();

  const allMasks = maskStore
    .getAll()
    .filter((m) => !filterLang || m.lang === filterLang);

  const [searchMasks, setSearchMasks] = useState<Mask[]>([]);
  const [searchText, setSearchText] = useState("");
  const masks = searchText.length > 0 ? searchMasks : allMasks;

  // simple search, will refactor later
  const onSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const result = allMasks.filter((m) => m.name.includes(text));
      setSearchMasks(result);
    } else {
      setSearchMasks(allMasks);
    }
  };

  const [editingMaskId, setEditingMaskId] = useState<number | undefined>();
  const editingMask =
    maskStore.get(editingMaskId) ?? BUILTIN_MASK_STORE.get(editingMaskId);
  console.log("打印一下", editingMask);
  const closeMaskModal = () => setEditingMaskId(undefined);

  const downloadAll = () => {
    downloadAs(JSON.stringify(masks), FileName.Masks);
  };

  const importFromFile = () => {
    readFromFile().then((content) => {
      try {
        const importMasks = JSON.parse(content);
        if (Array.isArray(importMasks)) {
          for (const mask of importMasks) {
            if (mask.name) {
              maskStore.create(mask);
            }
          }
          return;
        }
        //if the content is a single mask.
        if (importMasks.name) {
          maskStore.create(importMasks);
        }
      } catch {}
    });
  };

  return (
    <ErrorBoundary>
      <div className={styles["mask-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.Mask.Page.Title}
            </div>
            <div className="window-header-submai-title">
              {Locale.Mask.Page.SubTitle(allMasks.length)}
            </div>
          </div>

          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<DownloadIcon />}
                bordered
                onClick={downloadAll}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<UploadIcon />}
                bordered
                onClick={() => importFromFile()}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<CloseIcon />}
                bordered
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>

        <div className={styles["mask-page-body"]}>
          <div className={styles["mask-filter"]}>
            <input
              type="text"
              className={styles["search-bar"]}
              placeholder={Locale.Mask.Page.Search}
              autoFocus
              onInput={(e) => onSearch(e.currentTarget.value)}
            />
            <Select
              className={styles["mask-filter-lang"]}
              value={filterLang ?? Locale.Settings.Lang.All}
              onChange={(e) => {
                const value = e.currentTarget.value;
                if (value === Locale.Settings.Lang.All) {
                  setFilterLang(undefined);
                } else {
                  setFilterLang(value as Lang);
                }
              }}
            >
              <option key="all" value={Locale.Settings.Lang.All}>
                {Locale.Settings.Lang.All}
              </option>
              {AllLangs.map((lang) => (
                <option value={lang} key={lang}>
                  {ALL_LANG_OPTIONS[lang]}
                </option>
              ))}
            </Select>

            {/* <IconButton
              className={styles["mask-create"]}
              icon={<AddIcon />}
              text={Locale.Mask.Page.Create}
              bordered
              onClick={() => {
                const createdMask = maskStore.create();
                setEditingMaskId(createdMask.id);
              }}
            /> */}
          </div>

          <div>
            {masks.map((m) => (
              <div className={styles["mask-item"]} key={m.id}>
                <div className={styles["mask-header"]}>
                  <div className={styles["mask-icon"]}>
                    <MaskAvatar mask={m} />
                  </div>
                  <div className={styles["mask-title"]}>
                    <div className={styles["mask-name"]}>{m.name}</div>
                    <div className={styles["mask-info"] + " one-line"}>
                      {`${Locale.Mask.Item.Info(m.context.length)} / ${
                        ALL_LANG_OPTIONS[m.lang]
                      } / ${m.modelConfig.model}`}
                    </div>
                  </div>
                </div>
                <div className={styles["mask-actions"]}>
                  <IconButton
                    icon={<AddIcon />}
                    text={Locale.Mask.Item.Chat}
                    onClick={() => {
                      chatStore.newSession(m);
                      navigate(Path.Chat);
                    }}
                  />
                  {m.builtin ? (
                    <IconButton
                      icon={<EyeIcon />}
                      text={Locale.Mask.Item.View}
                      onClick={() => setEditingMaskId(m.id)}
                    />
                  ) : (
                    <IconButton
                      icon={<EditIcon />}
                      text={Locale.Mask.Item.Edit}
                      onClick={() => setEditingMaskId(m.id)}
                    />
                  )}
                  {!m.builtin && (
                    <IconButton
                      icon={<DeleteIcon />}
                      text={Locale.Mask.Item.Delete}
                      onClick={() => {
                        if (confirm(Locale.Mask.Item.DeleteConfirm)) {
                          maskStore.delete(m.id);
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingMask && (
        <div className="modal-mask">
          <Modal
            title={Locale.Mask.EditModal.Title(editingMask?.builtin)}
            onClose={closeMaskModal}
            actions={[
              <IconButton
                icon={<DownloadIcon />}
                text={Locale.Mask.EditModal.Download}
                key="export"
                bordered
                onClick={() =>
                  downloadAs(
                    JSON.stringify(editingMask),
                    `${editingMask.name}.json`,
                  )
                }
              />,
            ]}
          >
            <MaskConfig
              mask={editingMask}
              updateMask={(updater) =>
                maskStore.update(editingMaskId!, updater)
              }
              readonly={editingMask.builtin}
            />
          </Modal>
        </div>
      )}
    </ErrorBoundary>
  );
}

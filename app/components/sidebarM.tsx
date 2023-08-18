import { useState, useEffect, useRef } from "react";

import styles from "./slidebarM.module.scss";
import chatStyle from "./chat.module.scss";
import { IconButton } from "./button";
import carvalley from "../icons/carvalley.png";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import ResetIcon from "../icons/reload.svg";
import BrainIcon from "../icons/brain.svg";
import CopyIcon from "../icons/copy.svg";
import NextImage from "next/image";
import Locale from "../locales";
import { MaskAvatar, MaskConfig } from "./meet-config";
import { useMaskStore } from "../store/mask";
import { BUILTIN_MASK_STORE } from "../masks";
import { useAppConfig, useChatStore } from "../store";
import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { ListItem, Modal, showToast } from "./meet-ui-lib";

let flagNew = true;
const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        const n = chatStore.sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = chatStore.currentSessionIndex;
        if (e.key === "ArrowUp") {
          chatStore.selectSession(limit(i - 1));
        } else if (e.key === "ArrowDown") {
          chatStore.selectSession(limit(i + 1));
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}
export function SessionConfigModel(props: {
  onClose: () => void;
  isNew: boolean;
  editingMask: any;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const maskStore = useMaskStore();
  const navigate = useNavigate();

  return (
    <div className="modal-mask">
      <Modal
        title={props.isNew ? Locale.Context.AddMeet : Locale.Context.EditMeet}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="reset"
            icon={<ResetIcon />}
            bordered
            text="开始会议"
            onClick={() => {
              chatStore.newSession(props.editingMask);
              props.onClose();
              console.log("nkkhh", props.editingMask);
              // if (confirm(Locale.Memory.ResetConfirm)) {
              //   chatStore.updateCurrentSession(
              //     (session) => (session.memoryPrompt = ""),
              //   );
              // }
            }}
          />,
        ]}
      >
        {props.isNew && props.editingMask ? (
          <>
            <MaskConfig
              mask={props.editingMask}
              isNew={true}
              updateMask={(updater) =>
                maskStore.update(props.editingMask.id!, updater)
              }
            />
          </>
        ) : (
          <>
            <MaskConfig
              mask={session.mask}
              updateMask={(updater) => {
                const mask = { ...session.mask };
                updater(mask);
                chatStore.updateCurrentSession(
                  (session) => (session.mask = mask),
                );
              }}
              shouldSyncFromGlobal
              extraListItems={
                session.mask.modelConfig.sendMemory ? (
                  <ListItem
                    title={`${Locale.Memory.Title} (${session.lastSummarizeIndex} of ${session.messages.length})`}
                    subTitle={
                      session.memoryPrompt || Locale.Memory.EmptyContent
                    }
                  ></ListItem>
                ) : (
                  <></>
                )
              }
            ></MaskConfig>
          </>
        )}
      </Modal>
    </div>
  );
}
function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
  isNew: boolean;
  editingMask: any;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.mask.context;
  const maskStore = useMaskStore();
  return (
    <div className={chatStyle["prompt-toast"]} key="prompt-toast">
      {props.showToast && (
        <div
          className={chatStyle["prompt-toast-inner"] + " clickable"}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={chatStyle["prompt-toast-content"]}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )}
      {props.showModal && (
        <SessionConfigModel
          onClose={() => {
            if (props.isNew) {
              maskStore.delete(props.editingMask?.id);
            }
            // console.log('点击关闭')
            props.setShowModal(false);
          }}
          isNew={props.isNew}
          editingMask={props.editingMask}
        />
      )}
    </div>
  );
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

export function SideBarM(props: { className?: string }) {
  const chatStore = useChatStore();

  const [hitBottom, setHitBottom] = useState(true);
  // drag side bar
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();
  const [showPromptModal, setShowPromptModal] = useState(false);
  const maskStore = useMaskStore();
  const [editingMaskId, setEditingMaskId] = useState<number | undefined>();
  const editingMask =
    maskStore.get(editingMaskId) ?? BUILTIN_MASK_STORE.get(editingMaskId);
  // console.log('晶科科技',props,editingMask)
  useHotKey();

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-header"]}>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          {/* <ChatGptIcon /> */}
          <NextImage
            src={carvalley.src}
            width={30}
            height={30}
            alt="bot"
            className="user-avatar"
          />
        </div>
        <div className={styles["sidebar-title"]}>车之谷 AutoProAdviser</div>
      </div>

      <div className={styles["sidebar-header-bar"]}>
        <IconButton
          icon={<AddIcon />}
          text={shouldNarrow ? undefined : Locale.Mask.Meet.Add}
          className={styles["sidebar-bar-button"]}
          onClick={() => {
            flagNew = true;
            setShowPromptModal(true);
            const createdMask = maskStore.create({
              context: [
                {
                  role: "user",
                  content: "",
                  date: "",
                },
              ],
            });
            setEditingMaskId(createdMask.id);
            console.log("测试时", createdMask);
          }}
          shadow
        />
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Meetings);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"] + " " + styles.mobile}>
            <IconButton
              icon={<CloseIcon />}
              onClick={() => {
                if (confirm(Locale.Home.DeleteChat)) {
                  chatStore.deleteSession(chatStore.currentSessionIndex);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div
        className={styles["sidebar-drag"]}
        onMouseDown={(e) => onDragMouseDown(e as any)}
      ></div>

      <PromptToast
        showToast={!hitBottom}
        showModal={showPromptModal}
        setShowModal={setShowPromptModal}
        isNew={flagNew}
        editingMask={editingMask}
      />
    </div>
  );
}

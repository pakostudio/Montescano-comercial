"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { motion,useIsPresent,useReducedMotion } from "motion/react";
import {FAST,NORMAL,EASE} from '../lib/motion';
import {Action} from './MotionUI';
let openDialogs=0;
let previousOverflow='';
export default function Dialog({
  children,
  label,
  onClose,
  sheet = false,
}: {
  children: ReactNode;
  label: string;
  onClose: () => void;
  sheet?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const present=useIsPresent();
  const reduced=useReducedMotion();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const el = ref.current!;
    const before = document.activeElement as HTMLElement | null;
    el.showModal();
    if(openDialogs++===0){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
    return () => {
      el.close();
      if(--openDialogs===0){document.body.style.overflow=previousOverflow;if(before?.isConnected)before.focus({preventScroll:true});}
    };
  }, []);
  return (
    <motion.dialog
      ref={ref}
      aria-label={label}
      className={sheet ? "dialog sheet" : "dialog"}
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:present?NORMAL:FAST}}
      onCancel={(e) => {
        e.preventDefault();
        closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRef.current();
      }}
    >
      <div className="dialog-scrim" aria-hidden="true" onClick={()=>present&&onClose()}/>
      <motion.div
        className="dialog-inner"
        initial={{opacity:0,scale:reduced||sheet?1:.975,x:reduced||!sheet?0:'var(--sheet-x)',y:reduced?0:sheet?'var(--sheet-y)':16}}
        animate={{opacity:1,scale:1,x:0,y:0}}
        exit={{opacity:0,scale:reduced||sheet?1:.985,x:reduced||!sheet?0:'var(--sheet-x)',y:reduced?0:sheet?'var(--sheet-y)':10}}
        transition={{duration:present?NORMAL:FAST,ease:EASE}}
      >
        <Action
          autoFocus
          className="close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </Action>
        {children}
      </motion.div>
    </motion.dialog>
  );
}

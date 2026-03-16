import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

type ExceptionHandlingData = {
    label?: string;
    labelError?: string | null;
    mustFillLabel?: boolean;
    handles?: HandleData[];
};

export default function ExceptionHandling({ data }: DataProps) {

  const exceptionData = data as ExceptionHandlingData;

  const labelFromNode = exceptionData.label ?? "";
  const labelError = exceptionData.labelError ?? null;
  const mustFillLabel = exceptionData.mustFillLabel ?? false;

  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const { isTryingToConnect } = useCanvas();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(labelFromNode);
  const { setIsZoomOnScrollEnabled } = useCanvas();

  const raw = value.trim();

  let partitionsText = "";
  let exceptionText = "";
  let isOpenPartitions = false;

  if (raw.startsWith("(")) {
    const closeIndex = raw.indexOf(")");

    if (closeIndex === -1) {
      isOpenPartitions = true;
      partitionsText = raw.slice(1).trim();
      exceptionText = "";
    } else {
      partitionsText = raw.slice(1, closeIndex).trim();
      exceptionText = raw.slice(closeIndex + 1).trim();
    }
  } else {
    exceptionText = raw;
  }

  const parsedPartitions = partitionsText
    ? partitionsText.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const nextPartitionLabel = `Partición ${parsedPartitions.length + 1}...`;

  const exceptionGuide = {
    partitionsOk: parsedPartitions.length > 0,
    partitionsText: parsedPartitions.join(", "),
    isOpenPartitions,
    nextPartitionLabel,
    exceptionOk: exceptionText.length > 0,
    exceptionText,
  };

  // Manejo de handles
  const [showHandles, setShowHandles] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const { handles, magneticHandle } = useHandle({ 
    handleRef, 
    nodeRef, 
    maxHandles: 1,
    initialHandles: exceptionData.handles
  });

  // Callback ref para actualizar handleRef cuando cambie el último handle
  const setHandleRef = useCallback((node: HTMLDivElement | null) => {
    handleRef.current = node;
  }, []);

  // Sincronizamos handles con node.data cuando cambien
  useEffect(() => {
    if (!nodeId) return;
    setNodes(nodes => nodes.map(n => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, handles } }
        : n
    ));
  }, [handles, nodeId, setNodes]);

  useEffect(() => {
  if (!nodeId || !isEditing) return;

  setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, label: value } }
          : n
      )
    );
  }, [value, nodeId, setNodes, isEditing]);

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
  
    if (!nodeId) return;
    
    setNodes((nodes) =>
      nodes.map((n) =>
          n.id === nodeId
              ? { ...n, data: { ...n.data, labelError: null } }
              : n
      )
    );
    if (evt.target.value.length >= TEXT_AREA_MAX_LEN) {
      setValue(evt.target.value.slice(0, TEXT_AREA_MAX_LEN));
    } else {
      setValue(evt.target.value);
    }
  }, [nodeId, setNodes]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    setValue(labelFromNode);
  }, [labelFromNode]);

  useEffect(() => {
    if (!nodeId) return;

    const current = value.trim();

    if (!isEditing && mustFillLabel && current === "") {
        setNodes((nodes) =>
            nodes.map((n) =>
                n.id === nodeId
                    ? {
                        ...n,
                        data: {
                            ...n.data,
                            mustFillLabel: false,
                            labelError: null,
                        },
                    }
                    : n
            )
        );

        setIsEditing(true);
        setIsZoomOnScrollEnabled(false);

        setTimeout(() => {
            textareaRef.current?.focus();
            textareaRef.current?.select();
        }, 0);
    }
  }, [nodeId, mustFillLabel, value, isEditing, setNodes, setIsZoomOnScrollEnabled]);

  const handleDoubleClick = useCallback(() => {
    if (!isEditing) {
      if (!nodeId) return;

      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, labelError: null } }
            : n
        )
      );

      setIsEditing(true);
      setIsZoomOnScrollEnabled(false);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        }
      }, 0);
    }
  }, [isEditing, nodeId, setNodes, setIsZoomOnScrollEnabled]);

  const handleBlur = useCallback(() => {
    if (!nodeId) return;

    setIsEditing(false);
    setIsZoomOnScrollEnabled(true);

    const trimmed = value.trim();

    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                mustFillLabel: false,
                label: trimmed,
                labelError: trimmed ? null : "No puede estar vacío.",
              },
            }
          : n
      )
    );
  }, [nodeId, value, setNodes, setIsZoomOnScrollEnabled]);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowHandles(isTryingToConnect)}
      onMouseLeave={() => setShowHandles(false)}
      className="bg-transparent p-4"
      onMouseMove={(evt) => { magneticHandle(evt) }}
    >
      <div ref={nodeRef} className="node-rounded">
        {handles.map((handle, i) => (
          <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} left={handle.left} top={handle.top} />
        ))}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onWheel={(e) => e.stopPropagation()}
          readOnly={!isEditing}
          placeholder={`(Particiones...)\nControl de excepciones`}
          className={`node-textarea ${
              isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'
          }`}
          rows={1}
        />
        {!isEditing && labelError && (
            <p className="node-error-text">{labelError}</p>
        )}
        {isEditing &&
          <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
        }
        {isEditing && (
          <div className="mt-1 text-[11px] leading-5 font-mono text-center select-none">
            <span className="text-gray-400">(</span>

            {exceptionGuide.partitionsOk ? (
              <>
                <span className="text-green-600">
                  {exceptionGuide.partitionsText}
                </span>

                {exceptionGuide.isOpenPartitions && (
                  <>
                    <span className="text-gray-400">, </span>
                    <span className="text-gray-400">{exceptionGuide.nextPartitionLabel}</span>
                  </>
                )}

                {!exceptionGuide.isOpenPartitions && (
                  <span className="text-gray-400">)</span>
                )}
              </>
            ) : (
              <>
                <span className="text-gray-400">P1, P2...</span>
                <span className="text-gray-400">)</span>
              </>
            )}

            <span className="text-gray-400">{" "}</span>

            <span className={exceptionGuide.exceptionOk ? "text-green-600" : "text-gray-400"}>
              {exceptionGuide.exceptionOk ? exceptionGuide.exceptionText : "Excepción"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
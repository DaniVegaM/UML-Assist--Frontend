import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

type CallOperationData = {
  label?: string;
  labelError?: string | null;
  mustFillLabel?: boolean;
  handles?: HandleData[];
};


export default function CallOperation({ data }: DataProps) {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();

  const { setIsZoomOnScrollEnabled } = useCanvas();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const callOperationData = data as CallOperationData;

  const labelFromNode = callOperationData.label ?? "";
  const labelError = callOperationData.labelError ?? null;
  const mustFillLabel = callOperationData.mustFillLabel ?? false;
  const [value, setValue] = useState(labelFromNode);

  const raw = value.trim();

  let partitionsText = "";
  let operationText = "";
  let isOpenPartitions = false;

  if (raw.startsWith("(")) {
    const closeIndex = raw.indexOf(")");

    if (closeIndex === -1) {
      isOpenPartitions = true;

      const afterOpen = raw.slice(1).trim();
      const signatureMatch = afterOpen.match(/([A-Z][A-Za-z0-9]*)::([a-z][A-Za-z0-9]*)$/);

      if (signatureMatch && signatureMatch.index !== undefined) {
        partitionsText = afterOpen.slice(0, signatureMatch.index).trim();
        operationText = signatureMatch[0].trim();
      } else {
        partitionsText = afterOpen;
        operationText = "";
      }
    } else {
      partitionsText = raw.slice(1, closeIndex).trim();
      operationText = raw.slice(closeIndex + 1).trim();
    }
  } else {
    operationText = raw;
  }

  const parsedPartitions = partitionsText
    ? partitionsText.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const nextPartitionLabel = `Partición ${parsedPartitions.length + 1}...`;

  const colonCount = (operationText.match(/:/g) ?? []).length;
  const doubleColonCount = (operationText.match(/::/g) ?? []).length;

  const hasValidDoubleColon =
    colonCount === 2 &&
    doubleColonCount === 1 &&
    operationText.indexOf("::") === operationText.lastIndexOf("::");

  const [classPartRaw, operationPartRaw = ""] = operationText.includes("::")
    ? operationText.split("::")
    : [operationText.split(":")[0] ?? "", ""];

  const classPart = classPartRaw?.trim() ?? "";
  const operationPart = operationPartRaw?.trim() ?? "";

  const hasTrailingComma = /,\s*$/.test(partitionsText);

  const CLASS_REGEX = /^[A-Z][A-Za-z0-9]*$/;
  const OPERATION_REGEX = /^[a-z][A-Za-z0-9]*$/;

  const callOperationGuide = {
    partitionsOk: parsedPartitions.length > 0,
    partitionsText: parsedPartitions.join(", "),
    isOpenPartitions,
    nextPartitionLabel,
    classOk: CLASS_REGEX.test(classPart),
    classText: classPart,
    hasValidDoubleColon,
    operationOk: OPERATION_REGEX.test(operationPart),
    operationText: operationPart,
  };

  // Manejo de handles
  const [showHandles, setShowHandles] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const { handles, magneticHandle } = useHandle({ 
    handleRef, 
    nodeRef,
    initialHandles: callOperationData.handles
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
        ? { ...n, data: { ...n.data, handles, ...(isEditing ? { label: value } : {}) } }
        : n
    ));
  }, [handles, nodeId, setNodes, value,  isEditing]);

  useEffect(() => {
    setValue(labelFromNode);
  }, [labelFromNode]);

  useEffect(() => {
    if (!nodeId) return;

    const current = String(labelFromNode ?? value ?? "").trim();

    if (!isEditing && mustFillLabel && current === "") {
      setNodes((nds) =>
        nds.map((n) =>
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
  }, [nodeId, mustFillLabel, labelFromNode, value, isEditing, setNodes, setIsZoomOnScrollEnabled]);
    
  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!nodeId) return;

    let newValue = evt.target.value;

    if (newValue.length > TEXT_AREA_MAX_LEN) {
      newValue = newValue.slice(0, TEXT_AREA_MAX_LEN);
    }

    const trimmed = newValue.trim();

    const operationPartToValidate = trimmed.startsWith("(")
      ? (() => {
          const closeIndex = trimmed.indexOf(")");

          if (closeIndex !== -1) {
            return trimmed.slice(closeIndex + 1).trim();
          }

          const afterOpen = trimmed.slice(1).trim();
          const signatureMatch = afterOpen.match(/([A-Z][A-Za-z0-9]*)::([a-z][A-Za-z0-9]*)$/);

          return signatureMatch ? signatureMatch[0].trim() : "";
        })()
      : trimmed;

    const colonCount = (operationPartToValidate.match(/:/g) ?? []).length;
    const doubleColonCount = (operationPartToValidate.match(/::/g) ?? []).length;

    if (colonCount > 2) return;
    if (doubleColonCount > 1) return;
    if (operationPartToValidate.includes(":::")) return;

    // No permitir texto entre los dos puntos, por ejemplo: :dd:
    if (/:[^:\s]+:/.test(operationPartToValidate)) return;

    // Si hay un solo ":" y no está al final, también bloquear
    if (
      colonCount === 1 &&
      !operationPartToValidate.endsWith(":")
    ) {
      return;
    }

    if (!newValue.trim()) {
      newValue = "";
    }

    const normalizedValue = newValue.trim() ? newValue : "";

    setValue(normalizedValue);

    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                label: normalizedValue,
                labelError: normalizedValue ? null : "No puede estar vacío.",
              },
            }
          : n
      )
    );
  }, [nodeId, setNodes]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleDoubleClick = useCallback(() => {
    if (!isEditing) {
      if (!nodeId) return;
      setNodes((nds) =>
        nds.map((n) =>
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

    setNodes((nds) =>
      nds.map((n) =>
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
  }, [value, nodeId, setNodes, setIsZoomOnScrollEnabled]);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowHandles(true)}
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              textareaRef.current?.blur();
            }
          }}
          readOnly={!isEditing}
          placeholder={`(Particiones...)\nC::o`}
          className={`node-textarea ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'}`}
          rows={1}
        />
        {!isEditing && labelError && value.trim() === "" && (
          <p className="node-error-text">{labelError}</p>
        )}
        {isEditing && (
          <div className="mt-1 text-[11px] leading-5 font-mono text-center select-none">
            <span className={raw.startsWith("(") ? "text-green-600" : "text-gray-400"}>(</span>

            {callOperationGuide.partitionsOk ? (
              <>
                <span className="text-green-600">
                  {callOperationGuide.partitionsText}
                </span>

                {(callOperationGuide.isOpenPartitions || hasTrailingComma) && (
                  <>
                    <span className="text-gray-400">, </span>
                    <span className="text-gray-400">{callOperationGuide.nextPartitionLabel}</span>
                  </>
                )}

                {!callOperationGuide.isOpenPartitions && !hasTrailingComma && (
                  <span className="text-green-600">)</span>
                )}
              </>
            ) : (
              <>
                <span className="text-gray-400">Partición 1, Partición 2...</span>
                <span className={!callOperationGuide.isOpenPartitions && raw.includes(")") ? "text-green-600" : "text-gray-400"}>
                  )
                </span>
              </>
            )}

            <span className="text-gray-400">{" "}</span>

            <span className={callOperationGuide.classOk ? "text-green-600" : "text-gray-400"}>
              {callOperationGuide.classOk ? callOperationGuide.classText : "C"}
            </span>

            <span className={callOperationGuide.hasValidDoubleColon ? "text-green-600" : "text-gray-400"}>
              ::
            </span>

            <span className={callOperationGuide.operationOk ? "text-green-600" : "text-gray-400"}>
              {callOperationGuide.operationOk ? callOperationGuide.operationText : "o"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
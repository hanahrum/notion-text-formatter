import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const getFormattedDate = (dateStr: string): string => {
    if (!dateStr || !/\d{4}\/\d{2}\/\d{2}/.test(dateStr)) return "없음";
    const [, month, day] = dateStr.split("/");
    return `${Number(month)}/${Number(day)}`;
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => alert("클립보드에 복사되었습니다!"),
        () => fallbackCopy(text)
      );
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      alert("클립보드에 복사되었습니다!");
    } catch {
      alert("클립보드 복사 실패 😢");
    }
    document.body.removeChild(textarea);
  };

  const handleConvert = () => {
    const lines = input.trim().split("\n");
    const qaItems: string[] = [];
    const personalItems: string[] = [];

    for (const line of lines) {
      const cols = line.split("\t");
      if (cols.length < 2) continue;

      const workType = cols[0] || "";
      const title = cols[1]?.trim();
      const done = cols[2]?.trim();
      const live = cols[3]?.trim();

      if (!title) continue;

      const cleanWorkType = workType
        .replace(/[\s\u200B-\u200D\uFEFF]/g, "")
        .toLowerCase();

      if (!cleanWorkType) {
        const date = getFormattedDate(live);
        qaItems.push(`- ${title} (배포: ${date})`);
      } else {
        const date = getFormattedDate(done);
        personalItems.push(`- [${workType.trim()}] ${title} (목표일: ${date})`);
      }
    }

    const resultParts: string[] = [];

    if (qaItems.length > 0) {
      resultParts.push("<QA 업무>");
      resultParts.push(...qaItems);
      resultParts.push("");
    }

    if (personalItems.length > 0) {
      resultParts.push("<개인업무>");
      resultParts.push(...personalItems);
    }

    const resultText = resultParts.join("\n");
    setOutput(resultText);
    copyToClipboard(resultText);
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        ※ 노션 표 복사 시, 헤더(첫 줄)가 포함되지 않도록 내용만 드래그하여
        복사해 주세요.
      </p>

      <textarea
        placeholder="여기에 노션 표 데이터를 붙여넣기 해주세요"
        rows={10}
        style={{ width: "100%", marginBottom: "1rem" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={handleConvert}>변환 및 복사</button>
      </div>

      <div
        onClick={() => {
          if (output) {
            copyToClipboard(output);
          }
        }}
        style={{
          whiteSpace: "pre-wrap",
          background: "#f9f9f9",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          marginTop: "1rem",
          cursor: "pointer",
          minHeight: "150px",
          color: output ? "#000" : "#aaa",
        }}
      >
        {output || "변환된 결과가 여기에 표시됩니다"}
      </div>
    </div>
  );
}

export default App;

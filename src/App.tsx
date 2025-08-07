import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const getFormattedDate = (dateStr: string): string => {
    if (!dateStr || !/\d{4}\/\d{2}\/\d{2}/.test(dateStr)) return "없음";
    const [, month, day] = dateStr.split("/");
    return `${Number(month)}/${Number(day)}`;
  };

  const extractTime = (str: string): string => {
    // 오전 9:00, 오후 13:00 등을 추출
    const match = str.match(/(오전|오후)\s?\d{1,2}:\d{2}/);
    return match ? match[0].replace(/\s+/, "") : ""; // 공백 제거
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert("변환된 결과가 클립보드에 복사되었습니다.");
        })
        .catch(() => fallbackCopy(text));
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
      alert("변환된 결과가 클립보드에 복사되었습니다.");
    } catch {
      alert("클립보드 복사에 실패했습니다.");
    }
    document.body.removeChild(textarea);
  };

  const handleConvert = () => {
    const lines = input.trim().split("\n");

    const meetings: string[] = [];
    const qaItems: string[] = [];
    const personalItems: string[] = [];
    const noTypeItems: string[] = [];

    for (const line of lines) {
      const cols = line.split("\t");
      if (cols.length < 2) continue;

      const workTypeRaw = cols[0]?.trim();
      const title = cols[1]?.trim();
      const done = cols[2]?.trim();
      const live = cols[3]?.trim();

      if (!title) continue;

      const normalizedType = (workTypeRaw || "").toUpperCase();

      if (!workTypeRaw || normalizedType === "") {
        noTypeItems.push(`- ${title}`);
      } else if (normalizedType === "회의") {
        const timeCandidate = cols.find((c) =>
          /(오전|오후)\s?\d{1,2}:\d{2}/.test(c)
        );
        const time = timeCandidate ? extractTime(timeCandidate) : "";
        meetings.push(time ? `- ${title} (${time})` : `- ${title}`);
      } else if (normalizedType === "JIRA" || normalizedType === "QMS") {
        const date = getFormattedDate(live);
        qaItems.push(`- ${title} (배포: ${date})`);
      } else {
        const date = getFormattedDate(done);
        personalItems.push(`- [${workTypeRaw}] ${title} (목표일: ${date})`);
      }
    }

    const resultParts: string[] = [];

    if (meetings.length > 0) {
      resultParts.push("[회의]");
      resultParts.push(...meetings, "");
    }

    if (qaItems.length > 0) {
      resultParts.push("[QA 업무]");
      resultParts.push(...qaItems, "");
    }

    if (personalItems.length > 0) {
      resultParts.push("[개인업무]");
      resultParts.push(...personalItems, "");
    }

    if (noTypeItems.length > 0) {
      resultParts.push(...noTypeItems);
    }

    const result = resultParts.join("\n");
    setOutput(result);
    copyToClipboard(result);
  };

  return (
    <div style={{ padding: "1rem" }}>
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

      <textarea
        placeholder="변환된 결과가 여기에 표시됩니다"
        rows={10}
        style={{ width: "100%", marginTop: "1rem", whiteSpace: "pre-wrap" }}
        value={output}
        readOnly
      />
    </div>
  );
}

export default App;

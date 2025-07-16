import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const extractTime = (str: string): string => {
    const match = str.match(/(오전|오후)\s\d{1,2}:\d{2}/);
    return match ? match[0] : "시간없음";
  };

  const getFormattedDate = (str: string): string => {
    if (!str || !/\d{4}\/\d{2}\/\d{2}/.test(str)) return "없음";
    const [, month, day] = str.split("/");
    return `${Number(month)}/${Number(day)}`;
  };

  const handleConvert = () => {
    const lines = input.trim().split("\n");

    const meetings: string[] = [];
    const qa: string[] = [];
    const personal: string[] = [];

    for (const line of lines) {
      const cols = line.split("\t").map(c => c.trim());
      if (cols.length < 2) continue;

      const workType = cols[0] || "";
      const title = cols[1] || "";
      const dateCol = cols.find(c => /(오전|오후)\s\d{1,2}:\d{2}/.test(c)) || "";
      const done = cols[2] || "";
      const live = cols[3] || "";

      if (!title) continue;

      if (!workType) {
        qa.push(`- ${title} (배포: ${getFormattedDate(live)})`);
      } else if (workType.replace(/\s/g, "") === "회의") {
        meetings.push(`- [회의] ${title} (${extractTime(dateCol)})`);
      } else {
        personal.push(
          `- [${workType}] ${title} (목표일: ${getFormattedDate(done)})`
        );
      }
    }

    const result: string[] = [];
    if (meetings.length > 0) {
      result.push("<회의>");
      result.push(...meetings, "");
    }
    if (qa.length > 0) {
      result.push("<QA 업무>");
      result.push(...qa, "");
    }
    if (personal.length > 0) {
      result.push("<개인업무>");
      result.push(...personal);
    }

    setOutput(result.join("\n"));
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

      <div style={{ textAlign: "center" }}>
        <button onClick={handleConvert}>변환 및 복사</button>
      </div>

      <textarea
        placeholder="결과가 여기에 표시됩니다"
        rows={10}
        style={{
          width: "100%",
          marginTop: "1rem",
          whiteSpace: "pre-wrap",
        }}
        value={output}
        readOnly
        onClick={() => {
          navigator.clipboard.writeText(output);
          alert("복사되었습니다!");
        }}
      />
    </div>
  );
}

export default App;

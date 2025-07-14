import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleConvert = () => {
    const lines = input.trim().split("\n");
    const qaItems: string[] = [];
    const personalItems: string[] = [];

    const getFormattedDate = (dateStr: string): string => {
      if (!dateStr || !/\d{4}\/\d{2}\/\d{2}/.test(dateStr)) return "없음";
      const [, month, day] = dateStr.split("/");
      return `${Number(month)}/${Number(day)}`;
    };

    for (const line of lines) {
      const cols = line.split("\t");
      if (cols.length < 2) continue;

      const rawWorkType = cols[0] ?? "";
      const workType = rawWorkType.trim(); // 공백 제거
      const title = cols[1]?.trim();
      const done = cols[2]?.trim();
      const live = cols[3]?.trim();

      if (!title) continue;

      if (!workType) {
        // 업무유형이 비어있거나 공백 → QA 업무
        const date = getFormattedDate(live);
        qaItems.push(`- ${title} (배포: ${date})`);
      } else {
        // 업무유형이 존재 → 개인업무
        const date = getFormattedDate(done);
        personalItems.push(`- [${workType}] ${title} (목표일: ${date})`);
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

    setOutput(resultParts.join("\n"));
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
        <button onClick={handleConvert}>변환하기</button>
      </div>
      <textarea
        placeholder="변환된 결과가 여기에 표시됩니다"
        rows={10}
        style={{ width: "100%", marginTop: "1rem" }}
        value={output}
        readOnly
      />
    </div>
  );
}

export default App;

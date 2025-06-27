import { useState } from "react";
import { Textarea } from "./Textarea";
import { Button } from "./Button";

function formatDate(dateStr?: string): string {
  if (!dateStr || dateStr.trim() === "") return "없음";

  const parts = dateStr.includes("-")
    ? dateStr.split("-")
    : dateStr.includes("/")
    ? dateStr.split("/")
    : [];

  if (parts.length !== 3) return "없음";

  const [, month, day] = parts;
  return `${month}/${day}`;
}

export default function NotionToTextFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleConvert = () => {
    const lines = input.trim().split("\n");
    if (lines.length < 1) return;

    const defaultHeaders = ["업무유형", "타이틀", "완료일", "라이브일"];
    const firstLine = lines[0].split("\t").map((h) => h.trim());
    const hasHeaders =
      firstLine.includes("업무유형") || firstLine.includes("타이틀");

    const headers = hasHeaders ? firstLine : defaultHeaders;
    const dataStartIndex = hasHeaders ? 1 : 0;

    const idx = {
      type: headers.indexOf("업무유형"),
      title: headers.indexOf("타이틀"),
      done: headers.indexOf("완료일"),
      live: headers.indexOf("라이브일"),
    };

    if (Object.values(idx).some((i) => i === -1)) {
      setOutput(
        "⚠️ '업무유형', '타이틀', '완료일', '라이브일' 열이 필요합니다."
      );
      return;
    }

    const qaItems: string[] = [];
    const personalItems: string[] = [];

    for (let i = dataStartIndex; i < lines.length; i++) {
      const cols = lines[i].split("\t");
      const type = cols[idx.type]?.trim();
      const title = cols[idx.title]?.trim();
      const done = cols[idx.done]?.trim();
      const live = cols[idx.live]?.trim();

      if (!title) continue;

      if (!type) {
        const date = formatDate(live || done);
        qaItems.push(`- ${title} (라이브일: ${date})`);
      } else {
        const date = formatDate(done || live);
        personalItems.push(`- [${type}] ${title} (목표일: ${date})`);
      }
    }

    const result = [
      "<QA 업무>",
      ...qaItems,
      "",
      "<개인업무>",
      ...personalItems,
    ].join("\n");

    setOutput(result);
  };

  return (
    <div className="grid gap-4 p-4">
      <Textarea
        placeholder="노션에서 복사한 표를 여기에 붙여넣으세요 (첫 줄은 헤더가 없을 수도 있음)"
        rows={10}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button onClick={handleConvert}>변환하기</Button>
      <Textarea
        placeholder="결과가 여기에 표시됩니다"
        rows={10}
        value={output}
        readOnly
      />
    </div>
  );
}

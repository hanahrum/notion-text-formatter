import { useState } from "react";

function App() {
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");

	// 날짜 문자열에서 "월/일"만 안전하게 추출
	// 지원: 2025/11/21, 2025-11-21, 2025.11.21, 2025년 11월 21일
	// 뒤에 시간(오전/오후 HH:mm, HH:mm, (UTC) 등)이 붙어도 무시
	const getFormattedDate = (dateStr: string): string => {
		if (!dateStr) return "미정";
		const s = dateStr.trim();

		// 1) YYYY/MM/DD | YYYY-MM-DD | YYYY.MM.DD
		let m = s.match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);

		// 2) 한국어: YYYY년 M월 D일
		if (!m) {
			const kr = s.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
			if (kr) {
				// m[2] → month, m[3] → day 와 동일한 인덱스 배열을 구성
				m = [kr[0], kr[1], kr[2], kr[3]] as unknown as RegExpMatchArray;
			}
		}

		if (!m) return "미정";

		const month = Number(m[2]);
		const day = Number(m[3]);
		if (!Number.isFinite(month) || !Number.isFinite(day)) return "미정";

		return `${month}/${day}`; // 시간은 무시하고 M/D만 반환
	};

	const extractTime = (str: string): string => {
		if (!str) return "";
		// 1) 오전/오후 hh:mm
		let match = str.match(/(오전|오후)\s?\d{1,2}:\d{2}/);
		if (match) return match[0].replace(/\s?/, " ");

		// 2) 24시간 hh:mm
		match = str.match(/\b\d{1,2}:\d{2}\b/);
		if (match) return match[0];

		return "";
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
		// \r 제거로 줄바꿈 혼재 대응
		const lines = input.replace(/\r/g, "").trim().split("\n");

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
				const timeSource =
					cols.find((c) => /(오전|오후|\d{1,2}:\d{2})/.test(c)) || "";
				const time = extractTime(timeSource);
				meetings.push(time ? `- ${title} (${time})` : `- ${title}`);
			} else if (normalizedType === "JIRA" || normalizedType === "QMS") {
				// 라이브일에서 월/일만
				const date = getFormattedDate(live);
				qaItems.push(`- ${title} (배포: ${date})`);
			} else {
				// 개인업무: 목표일에서 월/일만
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
		<div style= padding: "1rem" >
			<p style= fontSize: "0.9rem", color: "#666" >
				※ 노션 표 복사 시, 헤더(첫 줄)가 포함되지 않도록 내용만 드래그하여
				<br />
				복사해 주세요.
			</p>

			<textarea
				placeholder="여기에 노션 표 데이터를 붙여넣기 해주세요"
				rows={10}
				style= width: "100%", marginBottom: "1rem" 
				value={input}
				onChange={(e) => setInput(e.target.value)}
			/>

			<div style= display: "flex", justifyContent: "center" >
				<button onClick={handleConvert}>변환 및 복사</button>
			</div>

			<textarea
				placeholder="변환된 결과가 여기에 표시됩니다"
				rows={10}
				style= width: "100%", marginTop: "1rem", whiteSpace: "pre-wrap" 
				value={output}
				readOnly
			/>
		</div>
	);
}

export default App;

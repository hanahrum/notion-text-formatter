// 타입 비교: 한글은 대소문자 변환하지 않음
const getType = (raw?: string) => (raw ?? "").trim();

// "오전/오후 HH:mm" 또는 "HH:mm" 추출, (UTC) 등 괄호 표기 제거
const extractTime = (str: string): string => {
	if (!str) return "";
	const cleaned = str.replace(/\(.*?\)/g, " "); // (UTC), (KST) 등 제거
	// 1) 오전/오후 hh:mm
	let m = cleaned.match(/(오전|오후)\s*\d{1,2}:\d{2}/);
	if (m) return m[0].replace(/\s+/, " ");
	// 2) 24시간 hh:mm
	m = cleaned.match(/\b\d{1,2}:\d{2}\b/);
	if (m) return m[0];
	return "";
};

// 문자열에서 월/일과(옵션) 시간 추출 → "M/D" 또는 "M/D HH:mm" 혹은 "M/D 오전 HH:mm"
const getFormattedDate = (dateStr: string, includeTime = false): string => {
	if (!dateStr) return "미정";

	const s = dateStr.trim();

	// 월/일 추출: YYYY/MM/DD, YYYY-MM-DD, YYYY.MM.DD
	let md = s.match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
	// 한국어 표기: YYYY년 M월 D일
	if (!md) {
		const kr = s.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
		if (kr) md = [kr[0], kr[1], kr[2], kr[3]] as unknown as RegExpMatchArray;
	}
	if (!md) return "미정";

	const month = Number(md[2]);
	const day = Number(md[3]);
	if (!Number.isFinite(month) || !Number.isFinite(day)) return "미정";

	const base = `${month}/${day}`;
	if (!includeTime) return base;

	// 시간 추출: 우선 "오전/오후 HH:mm" 또는 "HH:mm"
	const t = extractTime(s);
	return t ? `${base} ${t}` : base; // 시간이 없으면 날짜만
};

// ...중략(상위 상태 및 기타 함수 동일)...

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

		const type = getType(workTypeRaw);

		if (!workTypeRaw || type === "") {
			noTypeItems.push(`- ${title}`);

		} else if (type === "회의") {
			// 회의: 어디에 있어도 시간만 뽑아 "(HH:mm)" 형태로
			const timeSource = cols.find(
				(c) => /(오전|오후|\b\d{1,2}:\d{2}\b)/.test(c)
					|| /년\s*\d{1,2}\s*월\s*\d{1,2}\s*일/.test(c) // "YYYY년 M월 D일 HH:mm" 케이스
			) || "";
			const time = extractTime(timeSource);
			meetings.push(time ? `- ${title} (${time})` : `- ${title}`);

		} else if (type === "JIRA" || type === "QMS") {
			// QA: 라이브일(live) 기준. 시간이 있으면 "M/D 오전 HH:mm" 또는 "M/D HH:mm"
			const date = getFormattedDate(live, true);
			qaItems.push(`- ${title} (배포: ${date})`);

		} else {
			// 개인업무: 목표일(done) 기준. 날짜만
			const date = getFormattedDate(done, false);
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

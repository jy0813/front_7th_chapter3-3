/**
 * 검색어 하이라이트 함수
 * 텍스트 내 검색어를 <mark> 태그로 감싸서 강조 표시
 */
export const highlightText = (text: string, highlight: string) => {
  if (!text) return null;
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
      )}
    </span>
  );
};

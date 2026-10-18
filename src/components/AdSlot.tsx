// 광고가 들어갈 자리. 지금은 광고를 켜지 않았으므로 아무것도 그리지 않는다.
// NEXT_PUBLIC_SHOW_AD_SLOTS=1 이면 레이아웃 확인용 빈 상자를 보여 준다.
// 애드센스·카카오 애드핏·쿠팡 파트너스를 붙일 때 이 컴포넌트 안만 바꾸면 된다.
export function AdSlot({ name }: { name: string }) {
  if (process.env.NEXT_PUBLIC_SHOW_AD_SLOTS !== "1") return null;
  return (
    <aside className="ad-slot" aria-hidden="true" data-ad-slot={name}>
      Ad space · {name}
    </aside>
  );
}

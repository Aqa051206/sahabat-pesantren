const DISPLAY = {
  fontFamily: "'Bricolage Grotesque Variable', 'Lexend', sans-serif",
}

const STYLE = `
@keyframes sp-reveal { from { clip-path: circle(0% at 85% 70%); } to { clip-path: circle(150% at 85% 70%); } }
.sp-reveal { animation: sp-reveal .8s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .sp-reveal { animation: none; }
}
`

function LoginCelebration() {
  return (
    <>
      <style>{STYLE}</style>
      <div
        role="status"
        aria-live="polite"
        className="sp-reveal fixed inset-0 z-50 grid place-items-center bg-[#C9B6FF] px-6 text-center"
      >
        <p
          style={DISPLAY}
          className="text-[clamp(3rem,12vw,7rem)] font-extrabold lowercase leading-none tracking-[-0.05em] text-[#14201A]"
        >
          yey, masuk!
        </p>
      </div>
    </>
  )
}

export default LoginCelebration

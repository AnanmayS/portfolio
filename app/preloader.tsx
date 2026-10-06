import { person } from "./content";

/*
  The placard before the room: the name in the serif, a hairline that fills
  in the soft green, and a counter that ticks to 100. Then it lifts and the
  page's own entrance plays underneath.

  It shows once per visit. The script below runs before the body paints and
  stamps `data-preload` on the root only on the first page of a session, and
  never under reduced motion; without that stamp (or without JavaScript) the
  placard is simply never shown. The stamp comes off once everything has
  finished entering, so pages reached later enter at their usual pace.
*/
export const preloadScript = `try{var d=document.documentElement;if(!sessionStorage.getItem("preloaded")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){sessionStorage.setItem("preloaded","1");d.setAttribute("data-preload","");setTimeout(function(){d.removeAttribute("data-preload")},3000)}}catch(e){}`;

export function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader-card">
        <p className="preloader-name">{person.name}</p>
        <span className="preloader-track">
          <span className="preloader-fill" />
        </span>
        <span className="preloader-meta mono">
          <span>{person.where}</span>
          <span className="preloader-count" />
        </span>
      </div>
    </div>
  );
}

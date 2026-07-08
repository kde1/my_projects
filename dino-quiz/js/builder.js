(function () {
  "use strict";

  window.createBuilder = function createBuilder(ctx) {
    const { state, slots } = ctx;
    const { $, $$, titleCase } = ctx.helpers;
    const store = ctx.store;
    const celebrate = window.DinoCelebrate || null;
    const builderUnlocks = (window.DinoData && window.DinoData.builderUnlocks) || [];

    const layers = {
      body: $("#bodyLayer"),
      head: $("#headLayer"),
      neck: $("#neckLayer"),
      tail: $("#tailLayer"),
      backLeg: $("#backLegLayer"),
      frontLeg: $("#frontLegLayer"),
      armor: $("#armorLayer"),
      detail: $("#detailLayer")
    };
    const svg = $("#dinoSvg");
    const dino = $("#dino");
    const partControls = $("#partControls");
    const template = $("#slotTemplate");
    const nameEl = $("#dinoName");

    function path(attrs) {
      return `<path ${attrs}></path>`;
    }

    function ellipse(attrs) {
      return `<ellipse ${attrs}></ellipse>`;
    }

    function polygon(attrs) {
      return `<polygon ${attrs}></polygon>`;
    }

    function line(attrs) {
      return `<path class="crease" ${attrs}></path>`;
    }

    function tendon(attrs) {
      return `<path class="tendon" ${attrs}></path>`;
    }

    function textureShape(tag, attrs) {
      return tag === "ellipse"
        ? ellipse(`class="pattern patternFill" ${attrs}`)
        : path(`class="pattern patternFill" ${attrs}`);
    }

    function bodyMarkup(kind) {
      const bodies = {
        rex: `
          ${ellipse('class="skin" cx="450" cy="285" rx="180" ry="78"')}
          ${path('class="skin-shadow" d="M292 300 C382 354 535 360 622 302 C592 360 383 381 302 330Z"')}
          ${path('class="belly" d="M318 296 C383 350 532 355 604 300 C548 335 393 335 318 296Z"')}
          ${path('class="skin-highlight" d="M336 260 C405 230 523 229 588 265 C522 250 412 251 336 260Z"')}
          ${textureShape("ellipse", 'cx="450" cy="280" rx="171" ry="67"')}
          ${line('d="M349 278 C397 266 458 264 519 272"')}
          ${line('d="M383 319 C430 335 505 335 562 318"')}`,
        sauropod: `
          ${ellipse('class="skin" cx="458" cy="292" rx="205" ry="66"')}
          ${path('class="skin-shadow" d="M267 303 C366 354 565 358 662 306 C626 364 338 372 267 326Z"')}
          ${path('class="belly" d="M278 305 C378 350 557 350 655 305 C574 328 373 330 278 305Z"')}
          ${path('class="skin-highlight" d="M304 266 C391 239 528 240 617 267 C525 257 394 258 304 266Z"')}
          ${textureShape("ellipse", 'cx="458" cy="288" rx="195" ry="58"')}
          ${line('d="M336 283 C405 272 506 273 587 285"')}`,
        ceratops: `
          ${path('class="skin" d="M285 290 C325 216 548 208 628 273 C680 316 618 365 455 363 C317 360 246 333 285 290Z"')}
          ${path('class="skin-shadow" d="M278 306 C365 357 551 370 637 316 C604 374 332 385 267 334Z"')}
          ${path('class="belly" d="M300 310 C380 352 540 358 620 309 C560 334 384 336 300 310Z"')}
          ${path('class="skin-highlight" d="M313 272 C375 229 527 224 601 278 C518 257 390 257 313 272Z"')}
          ${textureShape("path", 'd="M297 284 C356 232 540 225 617 280 C567 312 354 314 297 284Z"')}
          ${line('d="M342 292 C414 280 520 282 587 300"')}`,
        raptor: `
          ${path('class="skin" d="M303 298 C366 230 526 228 601 283 C630 315 593 348 470 349 C365 350 285 330 303 298Z"')}
          ${path('class="skin-shadow" d="M303 313 C382 350 535 356 609 313 C579 359 367 371 293 328Z"')}
          ${path('class="belly" d="M331 311 C399 340 525 341 585 309 C522 327 398 328 331 311Z"')}
          ${path('class="skin-highlight" d="M335 276 C398 246 514 246 579 282 C503 267 407 267 335 276Z"')}
          ${textureShape("path", 'd="M322 288 C390 250 518 248 586 286 C526 302 393 303 322 288Z"')}
          ${line('d="M355 295 C418 284 505 286 566 301"')}`
      };
      return draggable("body", bodies[kind]);
    }

    function neckMarkup(bodyKind) {
      const neck = bodyKind === "sauropod"
        ? `${path('class="skin" d="M585 257 C620 180 658 126 704 96 C731 80 749 104 731 126 C692 174 657 223 634 288Z"')}
           ${path('class="skin-highlight" d="M628 204 C651 155 679 120 710 101 C680 140 656 186 635 249Z"')}
           ${path('class="skin-shadow" d="M607 266 C646 220 677 171 724 120 C704 180 671 239 634 288Z"')}
           ${textureShape("path", 'd="M600 254 C632 184 664 132 704 102 C716 96 727 104 725 116 C686 166 656 218 633 278Z"')}
           ${line('d="M636 219 C658 208 680 203 705 207"')}`
        : `${path('class="skin" d="M585 268 C631 237 663 228 693 238 C704 242 704 264 688 272 C655 286 624 290 585 306Z"')}
           ${path('class="skin-shadow" d="M594 291 C633 283 665 282 692 267 C655 293 624 301 585 306Z"')}
           ${path('class="skin-highlight" d="M604 265 C637 244 668 239 691 246 C658 251 632 260 604 265Z"')}
           ${line('d="M619 278 C644 268 666 265 686 266"')}`;
      return draggable("neck", neck);
    }

    function headMarkup(kind) {
      const heads = {
        rex: `
          ${path('class="skin head-skin" d="M655 214 C708 184 788 198 805 243 C820 284 765 302 706 288 C666 279 635 244 655 214Z"')}
          ${path('class="skin-shadow" d="M681 262 C725 289 780 282 805 245 C804 291 745 306 699 288Z"')}
          ${path('class="belly" d="M696 260 C732 281 777 278 802 253 C786 297 718 303 682 274Z"')}
          ${path('class="skin-highlight" d="M676 218 C711 202 762 207 789 229 C750 219 711 218 676 218Z"')}
          ${textureShape("path", 'd="M664 220 C710 197 781 207 801 244 C773 259 704 258 664 220Z"')}
          ${path('class="tooth" d="M723 281 l12 30 l12 -30Z"')}
          ${path('class="tooth" d="M754 284 l10 25 l11 -25Z"')}
          ${ellipse('class="eye" cx="746" cy="226" rx="8" ry="6"')}
          ${ellipse('class="pupil" cx="749" cy="226" rx="3" ry="5"')}
          ${ellipse('class="nostril" cx="789" cy="247" rx="5" ry="3"')}
          ${line('d="M694 247 C727 240 766 241 798 251"')}`,
        trike: `
          ${path('class="skin" d="M637 224 C667 177 744 177 776 224 C807 270 763 306 702 300 C655 296 613 262 637 224Z"')}
          ${path('class="skin" d="M631 205 C612 162 648 130 701 147 C756 127 797 160 775 207 C744 190 670 188 631 205Z"')}
          ${path('class="skin-shadow" d="M637 269 C682 302 755 298 787 252 C778 303 719 318 667 296Z"')}
          ${path('class="skin-highlight" d="M642 202 C676 170 734 166 770 202 C723 187 681 188 642 202Z"')}
          ${textureShape("path", 'd="M637 224 C667 177 744 177 776 224 C758 250 660 250 637 224Z"')}
          ${path('class="horn" d="M688 207 l-20 -67 l42 54Z"')}
          ${path('class="horn" d="M735 207 l34 -61 l-5 70Z"')}
          ${path('class="horn" d="M715 246 l27 42 l-44 -22Z"')}
          ${ellipse('class="eye" cx="725" cy="226" rx="8" ry="6"')}
          ${ellipse('class="pupil" cx="728" cy="226" rx="3" ry="5"')}
          ${ellipse('class="nostril" cx="770" cy="251" rx="5" ry="3"')}
          ${line('d="M650 214 C682 202 728 202 765 216"')}`,
        duck: `
          ${path('class="skin" d="M640 230 C690 186 765 202 804 248 C766 292 682 296 642 262 C629 251 629 240 640 230Z"')}
          ${path('class="skin" d="M673 204 C681 161 733 160 750 204 C727 194 697 194 673 204Z"')}
          ${path('class="skin-shadow" d="M674 272 C723 292 777 276 804 248 C785 297 711 309 666 279Z"')}
          ${path('class="belly" d="M690 270 C735 284 778 275 804 248 C791 301 711 309 666 279Z"')}
          ${path('class="skin-highlight" d="M666 225 C706 202 758 211 792 240 C752 226 709 222 666 225Z"')}
          ${textureShape("path", 'd="M651 231 C692 203 758 211 792 247 C755 260 694 258 651 231Z"')}
          ${ellipse('class="eye" cx="728" cy="227" rx="8" ry="6"')}
          ${ellipse('class="pupil" cx="731" cy="227" rx="3" ry="5"')}
          ${ellipse('class="nostril" cx="789" cy="250" rx="5" ry="3"')}
          ${line('d="M668 250 C704 244 752 246 792 253"')}`,
        raptor: `
          ${path('class="skin" d="M650 225 C697 190 776 209 800 249 C765 279 700 286 656 263 C637 253 635 237 650 225Z"')}
          ${path('class="skin-shadow" d="M674 264 C720 286 767 277 800 249 C782 287 713 299 656 263Z"')}
          ${path('class="skin-highlight" d="M669 222 C708 205 757 212 790 240 C747 227 706 225 669 222Z"')}
          ${textureShape("path", 'd="M655 226 C700 201 772 213 796 248 C759 260 697 256 655 226Z"')}
          ${path('class="tooth" d="M718 272 l9 22 l10 -21Z"')}
          ${path('class="tooth" d="M747 274 l8 20 l9 -20Z"')}
          ${ellipse('class="eye" cx="728" cy="225" rx="8" ry="6"')}
          ${ellipse('class="pupil" cx="731" cy="225" rx="3" ry="5"')}
          ${ellipse('class="nostril" cx="787" cy="248" rx="5" ry="3"')}
          ${line('d="M677 246 C713 238 758 240 791 250"')}`
      };
      return draggable("head", heads[kind]);
    }

    function tailMarkup(kind) {
      const tails = {
        whip: `
          ${path('class="skin" d="M290 292 C196 238 100 231 44 266 C118 276 198 309 306 325Z"')}
          ${path('class="skin-shadow" d="M83 266 C150 281 225 306 306 325 C208 326 120 293 44 266Z"')}
          ${textureShape("path", 'd="M290 292 C196 238 100 231 44 266 C118 276 198 309 306 325Z"')}
          ${tendon('d="M92 266 C158 270 228 291 294 313"')}`,
        club: `
          ${path('class="skin" d="M298 300 C205 255 125 262 77 292 C139 309 217 325 308 326Z"')}
          ${ellipse('class="skin" cx="70" cy="294" rx="42" ry="27"')}
          ${ellipse('class="skin-shadow" cx="65" cy="306" rx="34" ry="13"')}
          ${textureShape("path", 'd="M298 300 C205 255 125 262 77 292 C139 309 217 325 308 326Z"')}
          ${tendon('d="M104 293 C169 292 234 305 298 321"')}`,
        raptor: `
          ${path('class="skin" d="M306 294 C214 239 123 229 58 248 C118 270 214 310 316 324Z"')}
          ${path('class="skin-shadow" d="M95 254 C159 276 233 308 316 324 C215 321 119 279 58 248Z"')}
          ${textureShape("path", 'd="M306 294 C214 239 123 229 58 248 C118 270 214 310 316 324Z"')}
          ${tendon('d="M92 252 C164 259 236 289 305 315"')}`,
        spike: `
          ${path('class="skin" d="M300 300 C210 254 123 254 64 286 C130 301 214 321 312 326Z"')}
          ${path('class="skin-shadow" d="M96 286 C157 298 231 317 312 326 C221 331 128 309 64 286Z"')}
          ${textureShape("path", 'd="M300 300 C210 254 123 254 64 286 C130 301 214 321 312 326Z"')}
          ${polygon('class="horn" points="82,263 64,226 111,260"')}${polygon('class="horn" points="125,272 111,235 153,270"')}
          ${tendon('d="M101 284 C166 288 238 306 300 320"')}`
      };
      return draggable("tail", tails[kind]);
    }

    function legMarkup(kind, side) {
      const x = side === "front" ? 535 : 350;
      const flip = side === "front" ? 1 : -1;
      const legs = {
        runner: `
          ${path(`class="skin" d="M${x} 326 C${x + 18 * flip} 366 ${x + 4 * flip} 392 ${x + 33 * flip} 420 C${x + 9 * flip} 429 ${x - 31 * flip} 426 ${x - 48 * flip} 417 C${x - 18 * flip} 390 ${x - 12 * flip} 354 ${x - 33 * flip} 326Z"`)}
          ${ellipse(`class="joint" cx="${x - 15 * flip}" cy="348" rx="25" ry="17"`)}
          ${path(`class="skin-shadow" d="M${x - 17 * flip} 364 C${x + 9 * flip} 391 ${x + 14 * flip} 407 ${x + 33 * flip} 420 C${x + 4 * flip} 426 ${x - 28 * flip} 423 ${x - 48 * flip} 417 C${x - 24 * flip} 394 ${x - 21 * flip} 376 ${x - 17 * flip} 364Z"`)}
          ${tendon(`d="M${x - 18 * flip} 347 C${x - 7 * flip} 372 ${x + 3 * flip} 396 ${x + 29 * flip} 417"`)}
          ${path(`class="claw" d="M${x + 31 * flip} 418 l45 8 l-43 13Z"`)}`,
        pillar: `
          ${path(`class="skin" d="M${x - 34} 324 L${x + 34} 324 L${x + 48} 420 L${x - 48} 420Z"`)}
          ${ellipse(`class="joint" cx="${x}" cy="346" rx="38" ry="18"`)}
          ${path(`class="skin-shadow" d="M${x - 5} 332 L${x + 34} 324 L${x + 48} 420 L${x + 9} 420Z"`)}
          ${tendon(`d="M${x - 16} 338 C${x - 8} 368 ${x - 10} 392 ${x - 20} 418"`)}
          ${path(`class="claw" d="M${x - 45} 418 l102 0 l-28 18 l-78 0Z"`)}`,
        stalker: `
          ${path(`class="skin" d="M${x} 324 C${x + 36 * flip} 354 ${x + 12 * flip} 381 ${x + 70 * flip} 414 C${x + 33 * flip} 428 ${x - 10 * flip} 424 ${x - 38 * flip} 410 C${x - 8 * flip} 380 ${x - 22 * flip} 354 ${x - 45 * flip} 324Z"`)}
          ${ellipse(`class="joint" cx="${x - 18 * flip}" cy="347" rx="31" ry="19"`)}
          ${path(`class="skin-shadow" d="M${x - 7 * flip} 365 C${x + 20 * flip} 388 ${x + 42 * flip} 402 ${x + 70 * flip} 414 C${x + 33 * flip} 428 ${x - 10 * flip} 424 ${x - 38 * flip} 410 C${x - 16 * flip} 392 ${x - 11 * flip} 376 ${x - 7 * flip} 365Z"`)}
          ${tendon(`d="M${x - 24 * flip} 348 C${x - 7 * flip} 374 ${x + 21 * flip} 397 ${x + 65 * flip} 413"`)}
          ${path(`class="claw" d="M${x + 67 * flip} 412 l44 10 l-45 13Z"`)}`,
        quad: `
          ${path(`class="skin" d="M${x - 36} 322 C${x - 60} 360 ${x - 52} 388 ${x - 44} 421 L${x + 3} 421 C${x - 4} 383 ${x + 5} 352 ${x + 34} 322Z"`)}
          ${ellipse(`class="joint" cx="${x - 13}" cy="347" rx="34" ry="18"`)}
          ${path(`class="skin-shadow" d="M${x - 19} 354 C${x - 31} 382 ${x - 27} 402 ${x - 19} 421 L${x + 3} 421 C${x - 4} 383 ${x + 5} 352 ${x + 34} 322 C${x + 12} 338 ${x - 5} 345 ${x - 19} 354Z"`)}
          ${tendon(`d="M${x - 31} 344 C${x - 20} 372 ${x - 18} 395 ${x - 27} 419"`)}
          ${path(`class="claw" d="M${x - 51} 419 l73 0 l-20 15 l-55 0Z"`)}`
      };
      return draggable(`${side}Leg`, legs[kind]);
    }

    function armorMarkup(kind) {
      if (kind === "none") return "";
      if (kind === "plates") {
        return draggable("armor", `
          ${polygon('class="skin" points="314,242 346,174 378,245"')}
          ${polygon('class="skin" points="383,226 421,145 459,232"')}
          ${polygon('class="skin" points="468,226 506,150 543,236"')}
          ${polygon('class="skin" points="552,242 588,184 613,255"')}
          ${line('d="M346 185 L348 235"')}${line('d="M421 157 L423 222"')}${line('d="M506 163 L508 228"')}${line('d="M588 194 L590 242"')}`);
      }
      if (kind === "sail") {
        return draggable("armor", `
          ${path('class="skin" d="M334 252 C402 86 512 96 592 253 C501 223 411 222 334 252Z"')}
          ${path('class="skin-highlight" d="M384 230 C430 123 498 133 552 231 C497 213 436 212 384 230Z"')}
          ${line('d="M408 229 C420 178 428 135 438 104"')}${line('d="M476 223 C477 170 477 130 478 98"')}${line('d="M540 231 C524 178 511 139 499 110"')}`);
      }
      return draggable("armor", `
        ${polygon('class="horn" points="590,255 612,210 626,263"')}
        ${polygon('class="horn" points="626,246 653,204 660,260"')}
        ${polygon('class="horn" points="660,241 690,209 688,262"')}`);
    }

    function detailMarkup(kind) {
      const details = {
        claws: `
          ${path('class="claw" d="M592 417 l42 7 l-43 15Z"')}${path('class="claw" d="M403 416 l40 8 l-40 14Z"')}
          ${path('class="claw" d="M611 415 l31 4 l-31 11Z"')}${path('class="claw" d="M421 416 l29 5 l-30 10Z"')}`,
        beak: `
          ${path('class="horn" d="M788 249 C832 252 836 274 796 281 C810 267 810 257 788 249Z"')}
          ${tendon('d="M795 255 C811 259 818 264 814 272"')}`,
        feathers: `
          ${path('class="feather" d="M316 246 C272 214 260 178 291 142 C306 183 333 209 373 229Z"')}
          ${path('class="feather" d="M342 243 C306 211 300 184 324 154 C337 189 356 212 391 231Z"')}
          ${path('class="feather" d="M525 241 C568 205 585 170 559 132 C539 180 510 210 464 231Z"')}
          ${path('class="feather" d="M494 239 C535 209 549 181 532 151 C513 188 489 212 449 230Z"')}
          ${tendon('d="M292 150 C309 184 331 210 366 227"')}${tendon('d="M558 141 C540 181 514 209 471 229"')}`,
        crest: `
          ${path('class="skin" d="M692 207 C710 156 757 158 772 211 C748 196 717 195 692 207Z"')}
          ${path('class="skin-highlight" d="M712 199 C724 169 749 169 761 202 C745 194 727 193 712 199Z"')}
          ${line('d="M728 195 C730 180 732 169 735 160"')}`
      };
      return draggable("detail", details[kind]);
    }

    function draggable(part, markup) {
      const offset = state.offsets[part] || { x: 0, y: 0 };
      return `<g class="part" data-part="${part}" transform="translate(${offset.x} ${offset.y})">${markup}</g>`;
    }

    const patternFills = {
      scales: "url(#scalePattern)",
      stripes: "url(#stripePattern)",
      lava: "url(#lavaPattern)",
      spots: "url(#spotsPattern)"
    };

    function setPattern() {
      const patternEls = $$(".patternFill");
      patternEls.forEach((patternEl) => {
        if (state.pattern === "plain") {
          patternEl.setAttribute("fill", "transparent");
        } else {
          patternEl.setAttribute("fill", patternFills[state.pattern] || patternFills.scales);
        }
      });
      document.documentElement.style.setProperty("--pattern-opacity", state.pattern === "plain" ? "0" : ".55");
    }

    function hexToRgb(hex) {
      const clean = hex.replace("#", "");
      return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16)
      };
    }

    function rgbToHex({ r, g, b }) {
      const toHex = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function mixColor(hex, target, amount) {
      const from = hexToRgb(hex);
      const to = hexToRgb(target);
      return rgbToHex({
        r: from.r + (to.r - from.r) * amount,
        g: from.g + (to.g - from.g) * amount,
        b: from.b + (to.b - from.b) * amount
      });
    }

    function setSkinPalette() {
      const palette = {
        "--skin": state.baseColor,
        "--skin-light": mixColor(state.baseColor, "#f2e6b8", .28),
        "--skin-glow": mixColor(state.baseColor, "#fff3c0", .42),
        "--skin-dark": mixColor(state.baseColor, "#10170e", .52),
        "--skin-shadow": mixColor(state.baseColor, "#060805", .68),
        "--skin-line": mixColor(state.baseColor, "#050604", .72),
        "--belly": state.bellyColor,
        "--belly-light": mixColor(state.bellyColor, "#fff4cc", .38),
        "--belly-dark": mixColor(state.bellyColor, "#5b4d31", .42)
      };
      Object.entries(palette).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
        dino.style.setProperty(key, value);
      });
    }

    function renderDino() {
      const selected = getSelected();
      layers.tail.innerHTML = tailMarkup(selected.tail.id);
      layers.backLeg.innerHTML = legMarkup(selected.legs.id, "back");
      layers.body.innerHTML = bodyMarkup(selected.body.id);
      layers.frontLeg.innerHTML = legMarkup(selected.legs.id, "front");
      layers.neck.innerHTML = neckMarkup(selected.body.id);
      layers.head.innerHTML = headMarkup(selected.head.id);
      layers.armor.innerHTML = armorMarkup(selected.armor.id);
      layers.detail.innerHTML = detailMarkup(selected.detail.id);
      setSkinPalette();
      const scale = state.size / 100;
      dino.setAttribute("transform", `translate(${450 - 450 * scale} ${310 - 310 * scale}) scale(${scale}) rotate(${state.posture} 450 310)`);
      setPattern();
      enableDrag();
      const scores = updateScores();
      ctx.dna.renderDnaReport(scores);
      updateName();
    }

    function getSelected() {
      return Object.fromEntries(Object.keys(slots).map((key) => [key, slots[key][state[key]]]));
    }

    function updateScores() {
      const total = { speed: 0, strength: 0, defense: 0, reach: 0, ferocity: 0 };
      Object.values(getSelected()).forEach((choice) => {
        Object.entries(choice.score).forEach(([key, value]) => {
          if (key in total) total[key] += value;
        });
      });
      // Strength is always derived from the other combat stats (no part contributes
      // a raw "strength" score), so compute it directly rather than via `|| ` — a
      // legitimate total of 0 must not silently fall through to the formula.
      total.strength = total.ferocity * .55 + total.defense * .35 + total.reach * .2;
      const normalized = Object.fromEntries(Object.entries(total).map(([key, value]) => {
        const boost = state.dnaBoost[key] || 0;
        return [key, Math.max(1, Math.min(100, Math.round(value * 2.2 + 12 + boost)))];
      }));
      ["speed", "strength", "defense", "reach", "ferocity"].forEach((key) => {
        const valueEl = $(`#${key}Value`);
        const meterEl = $(`#${key}Meter`);
        if (!valueEl || !meterEl) return;
        valueEl.textContent = normalized[key];
        meterEl.style.setProperty("--value", `${normalized[key]}%`);
      });
      return normalized;
    }

    function updateName() {
      const selected = getSelected();
      const prefix = {
        rex: "Tyranno",
        sauropod: "Macro",
        ceratops: "Cerat",
        raptor: "Veloci"
      }[selected.body.id] || "Dino";
      const middle = {
        rex: "gnatho",
        trike: "corno",
        duck: "lambeo",
        raptor: "onych"
      }[selected.head.id] || "sauro";
      const suffix = {
        whip: "cauda",
        club: "malleus",
        raptor: "cursor",
        spike: "spina"
      }[selected.tail.id] || "saurus";
      nameEl.textContent = state.fossilName ? `${prefix}${middle}${suffix}` : "Custom dinosaur";
    }

    function runFieldTest() {
      const score = updateScores();
      const strongest = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
      const selected = getSelected();
      const summary = {
        speed: "It launches across the floodplain with a low, balanced sprint. The tail keeps it steady while the feet dig into the soft ground.",
        strength: "It is built for raw power. Big muscle anchors, stable legs, and weaponized jaws or claws give it serious close-range force.",
        defense: "It holds its ground like a living fortress. Armor and stance make it difficult for predators to find a weak angle.",
        reach: "It dominates the canopy edge and riverbank. Long anatomy lets it feed, display, or strike before rivals get close.",
        ferocity: "It is built for intimidation. The skull, claws, and posture make it look like the top threat in this habitat."
      }[strongest];
      const spliceNote = state.lastSplice
        ? ` DNA splice: ${ctx.getSpecies(state.lastSplice.sampleA).name} x ${ctx.getSpecies(state.lastSplice.sampleB).name}.`
        : "";
      $("#fieldSummary").textContent = `${summary} Favorite feature: ${selected.detail.label.toLowerCase()}.${spliceNote}`;
      $("#fieldTest").classList.add("is-visible");
      setTimeout(() => $("#fieldTest").classList.remove("is-visible"), 6500);
    }

    function enableDrag() {
      $$(".part").forEach((part) => {
        part.addEventListener("pointerdown", startDrag);
      });
    }

    function startDrag(event) {
      const target = event.currentTarget;
      const part = target.dataset.part;
      const start = pointerPoint(event);
      const origin = state.offsets[part] || { x: 0, y: 0 };
      target.setPointerCapture(event.pointerId);

      function move(moveEvent) {
        const current = pointerPoint(moveEvent);
        state.offsets[part] = {
          x: Math.max(-70, Math.min(70, origin.x + current.x - start.x)),
          y: Math.max(-55, Math.min(55, origin.y + current.y - start.y))
        };
        target.setAttribute("transform", `translate(${state.offsets[part].x} ${state.offsets[part].y})`);
      }

      function stop() {
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerup", stop);
        target.removeEventListener("pointercancel", stop);
      }

      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", stop);
      target.addEventListener("pointercancel", stop);
    }

    function pointerPoint(event) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      return point.matrixTransform(svg.getScreenCTM().inverse());
    }

    function randomize() {
      Object.keys(slots).forEach((slotName) => {
        state[slotName] = Math.floor(Math.random() * slots[slotName].length);
      });
      const palettes = [
        ["#5f7f45", "#d0c09a"],
        ["#7a6048", "#d8c79c"],
        ["#496a68", "#c9d2b1"],
        ["#6d6f3c", "#d6c08f"],
        ["#725042", "#ddc8ad"]
      ];
      const palette = palettes[Math.floor(Math.random() * palettes.length)];
      state.baseColor = palette[0];
      state.bellyColor = palette[1];
      state.pattern = ["scales", "stripes", "plain"][Math.floor(Math.random() * 3)];
      state.size = 88 + Math.floor(Math.random() * 29);
      state.posture = -8 + Math.floor(Math.random() * 18);
      state.dnaBoost = { speed: 0, strength: 0, defense: 0, reach: 0, ferocity: 0 };
      state.lastSplice = null;
      state.offsets = {};
      syncInputs();
      refreshControls();
      renderDino();
      runFieldTest();
    }

    function syncInputs() {
      $("#baseColor").value = state.baseColor;
      $("#bellyColor").value = state.bellyColor;
      $("#patternSelect").value = state.pattern;
      $("#sizeRange").value = state.size;
      $("#postureRange").value = state.posture;
      $("#nameToggle").checked = state.fossilName;
    }

    function snapshot() {
      const source = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${nameEl.textContent || "dinosaur"}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }

    function buildControls() {
      Object.keys(slots).forEach((slotName) => {
        const node = template.content.firstElementChild.cloneNode(true);
        $("h2", node).textContent = titleCase(slotName);
        const row = $(".choice-row", node);
        slots[slotName].forEach((choice, index) => {
          const button = document.createElement("button");
          button.className = "choice";
          button.type = "button";
          button.textContent = choice.label;
          button.addEventListener("click", () => {
            state[slotName] = index;
            refreshControls();
            renderDino();
          });
          row.appendChild(button);
        });
        $$(".stepper button", node).forEach((button) => {
          button.addEventListener("click", () => {
            const dir = Number(button.dataset.dir);
            state[slotName] = (state[slotName] + dir + slots[slotName].length) % slots[slotName].length;
            refreshControls();
            renderDino();
          });
        });
        partControls.appendChild(node);
      });
      refreshControls();
    }

    function refreshControls() {
      [...partControls.children].forEach((slotNode, slotIndex) => {
        const slotName = Object.keys(slots)[slotIndex];
        $$(".choice", slotNode).forEach((button, index) => {
          button.classList.toggle("is-selected", index === state[slotName]);
        });
      });
    }

    function isUnlockApplied(unlock) {
      if (unlock.type === "pattern") return state.pattern === unlock.value;
      if (unlock.type === "palette") return state.baseColor === unlock.value[0] && state.bellyColor === unlock.value[1];
      return false;
    }

    function applyUnlock(unlock) {
      if (unlock.type === "pattern") {
        state.pattern = unlock.value;
      } else if (unlock.type === "palette") {
        state.baseColor = unlock.value[0];
        state.bellyColor = unlock.value[1];
      }
      syncInputs();
      renderDino();
      renderShop();
    }

    function playerProfile() {
      return state.playerName && store ? store.getPlayer(state.playerName) : null;
    }

    function renderShop() {
      const shop = $("#builderShop");
      if (!shop) return;
      const coinsEl = $("#shopCoins");
      const hint = $("#shopHint");
      const player = playerProfile();
      const coins = player ? player.profile.coins : 0;
      if (coinsEl) coinsEl.textContent = `🪙 ${coins}`;
      if (hint) {
        hint.textContent = state.playerName
          ? "Tap a locked look to buy it, or an unlocked one to wear it."
          : "Join the Quiz as an explorer to earn and spend Fossil Coins.";
      }
      shop.innerHTML = builderUnlocks.map((unlock) => {
        const owned = player ? player.profile.unlocks.includes(unlock.id) : false;
        const applied = owned && isUnlockApplied(unlock);
        const affordable = coins >= unlock.cost;
        const disabled = !owned && (!state.playerName || !affordable);
        const tag = owned ? (applied ? "Applied" : "Apply") : `🔒 ${unlock.cost}🪙`;
        return `
          <button class="shop-item ${owned ? "is-owned" : ""} ${applied ? "is-applied" : ""}" type="button" data-id="${unlock.id}" ${disabled ? "disabled" : ""} title="${unlock.name}">
            <span class="shop-icon">${unlock.icon}</span>
            <span class="shop-name">${unlock.name}</span>
            <span class="shop-tag">${tag}</span>
          </button>
        `;
      }).join("");
    }

    function handleShopClick(event) {
      const button = event.target.closest(".shop-item");
      if (!button) return;
      const unlock = builderUnlocks.find((item) => item.id === button.dataset.id);
      if (!unlock || !state.playerName || !store) return;
      const player = store.getPlayer(state.playerName);
      const owned = player && player.profile.unlocks.includes(unlock.id);
      if (owned) {
        applyUnlock(unlock);
        return;
      }
      if (store.spendCoins(state.playerName, unlock.cost)) {
        store.unlock(state.playerName, unlock.id);
        if (celebrate) {
          celebrate.sound("unlock");
          celebrate.burst("small");
          celebrate.toast(`<span class="toast-icon">${unlock.icon}</span>Unlocked ${unlock.name}!`);
        }
        applyUnlock(unlock);
      }
    }

    function bindBuilderControls() {
      const shop = $("#builderShop");
      if (shop) shop.addEventListener("click", handleShopClick);
      renderShop();
      $("#baseColor").addEventListener("input", (event) => {
        state.baseColor = event.target.value;
        renderDino();
      });
      $("#bellyColor").addEventListener("input", (event) => {
        state.bellyColor = event.target.value;
        renderDino();
      });
      $("#patternSelect").addEventListener("change", (event) => {
        state.pattern = event.target.value;
        renderDino();
      });
      $("#sizeRange").addEventListener("input", (event) => {
        state.size = Number(event.target.value);
        renderDino();
      });
      $("#postureRange").addEventListener("input", (event) => {
        state.posture = Number(event.target.value);
        renderDino();
      });
      $("#nameToggle").addEventListener("change", (event) => {
        state.fossilName = event.target.checked;
        updateName();
      });
      $("#randomizeBtn").addEventListener("click", randomize);
      $("#snapshotBtn").addEventListener("click", snapshot);
      $("#testBtn").addEventListener("click", runFieldTest);
    }

    return {
      renderDino,
      updateScores,
      getSelected,
      buildControls,
      refreshControls,
      syncInputs,
      randomize,
      runFieldTest,
      mixColor,
      renderShop,
      bindBuilderControls
    };
  };
})();

// This file was generated by lezer-generator. You probably shouldn't edit it.
import {LRParser} from "@lezer/lr"
import {indentation, newlines, trackIndent} from "./tokens.js"
import {klipperConfigHighlighting} from "./highlight"
export const parser = LRParser.deserialize({
  version: 14,
  states: "+jOcQUOOPhOSOOOpQUO'#C`OOQQ'#Ct'#CtOcQUOOOOQQ'#Cv'#CvQxQUOOP}OQO)C>xO!SQYO,58zO![QbO,59POOQQ-E6r-E6rOsQUO'#CeOOQQ-E6t-E6tPOOO/'4d/'4dO!dQUO'#CbO!iQUO'#CcO!qQUO1G.fO!vQYO'#CcO!{QUO1G.kO#QQUO1G.kP#VQUO'#C`O#[QYO,58|O#aQYO'#CuO#fQUO,58}O#tQYO,59OO#yQUO7+$QO$OQUO,58}O$TQrO7+$VO$]QUO7+$VOOQQ1G.h1G.hOOQQ,59a,59aOOQQ-E6s-E6sOOQQ1G.j1G.jOOQQ<<Gl<<GlO$bQUO1G.iO$pQUO'#CiO$uQUO'#CiOOQQ'#Cw'#CwO$zQrO'#ChOOQQ<<Gq<<GqO$TQrO<<GqO%kQYO,59TO%rQ!dO,59TOOQQ-E6u-E6uOOQQAN=]AN=]O%zQUO'#D[O&VQUO'#CpO&eQUO'#CoO&pQUO'#D[OOQQ'#D['#D[O&{QUO'#CkO'TQVO'#CkOOQQ1G.o1G.oO'YQUO'#CsO'bQVO'#CsO'gQYO,59XO'lQYO'#CyO'qQUO,59YO'|QYO'#CxO(RQUO,59vOOQQ,59V,59VO(^QZO'#D_OOQQ,59_,59_O(eQ!eO'#DaOOQQ1G.s1G.sOOQQ,59e,59eOOQQ-E6w-E6wOOQQ,59d,59dOOQQ-E6v-E6vO(mQUO'#CzOOQR'#Cz'#CzO(rQZO,59yO)PQUO'#C{OOQR'#C{'#C{O)UQ!eO,59{OOQR,59f,59fOOQR-E6x-E6xOOQR1G/e1G/eOOQR,59g,59gOOQR-E6y-E6yOOQR1G/g1G/g",
  stateData: ")r~OPOSwOStOSPPQQPQ~OxQO~OPVOQVO~OTWOYXO~OxZO~Os]O~OyaOz_O~OZcO|bO~O{eO~OyfO{hO~O|iO~OzjO~OskO~O|lO~OTWO~OzmO~OznO~OyfO{VasVauVa~OzpO~OsqO~OyfO~O^sOftO~OsxO~OyfO{VisViuVi~O}yO~O}zO~O^sOftOp[Xx[X~O`!QOe!ROyaOz!OO!Q!PO~Os!TO~P%YOs!WO!S!VO~O{eOs!OXu!OX~OyfO}!XOsdXudX~O!P!YOscXucX~O!P![Os!OXu!OX~Os!^Ou!^O~Oq!_O~Os!`Ou!`O~Oq!aO~Oz!bO~O!Q!cO~O!P!YOsbauba~O`!eO~O!P![Os!Oau!Oa~Oq!_O~P%YOq!aO!S!jO~Os!mO~Oq!_Or!oOu!oO~P%YOs!pO~Oq!aOr!rOu!rO!S!jO~Ow!Sf^QP!Q`eT!QzY~",
  goto: "$t!UPPPP!VP!Z!c!k!nPP!s!yP#OP!^!^!^!^PP#R#U#[#g#n#u#{$R$XPPPPPPPPPPPPPP$_PP$fP$mTROSQ`WV!Ry!_!iQ^WV}y!_!iR`WVTOSUQwkR|xVukvxR!UyR!UzQSORYSSg_!OSogrRrjSUOSR[USvkxR{vQ!]!QR!f!]Q!Z!PR!d!ZQ!i!_R!n!iQ!l!aR!q!lQ!SyT!g!_!iQ!^!TT!h!_!iQ!`!WT!k!a!l",
  nodeNames: "⚠ Comment AutoGenerated Program Import ImportKeyword FilePath Path File ConfigBlock BlockType Identifier Body Option Parameter Value Pin VirtualPin Cords Number String Boolean GcodeKeyword Jinja2",
  maxTerm: 51,
  context: trackIndent,
  propSources: [klipperConfigHighlighting],
  skippedNodes: [0,1,2],
  repeatNodeCount: 8,
  tokenData: "!#W~RrXY#][]$cpq%rqr'}rs$qst(iuv$qwx$q|}*w}!O*|!O!P0g!P!Q1l!Q![1q![!]4V!_!`$q!c!h2|!h!i4[!i!r2|!r!s:r!s!v2|!v!w>a!w!}2|!}#OAP#P#QAU#Q#RAZ#R#S2|#T#Z2|#Z#[Ad#[#]2|#]#^G}#^#o2|#o#p$q#q#r$q#r#sAZ~#d_w~!S`XY#][]$cpq#]rs$quv$qwx$q}!O$q!O!P$q!Q![$q!_!`$q!c!}$q#R#S$q#T#o$q#o#p$q#q#r$q~$hRw~XY$c[]$cpq$c`$v^!S`XY$qpq$qrs$quv$qwx$q}!O$q!O!P$q!Q![$q!_!`$q!c!}$q#R#S$q#T#o$q#o#p$q#q#r$q~%{_w~!S`zQXY#][]$cpq%rrs$quv$qwx$q}!O&z!O!P$q!Q![&z!_!`$q!c!}&z#R#S&z#T#o&z#o#p$q#q#r$qb'R^!S`zQXY$qpq&zrs$quv$qwx$q}!O&z!O!P$q!Q![&z!_!`$q!c!}&z#R#S&z#T#o&z#o#p$q#q#r$qQ(QP!r!s(TQ(WP!c!}(ZQ(^P!Q![(aQ(fP`Q!Q![(a~(nVP~OY)TZ])T^z)Tz{)o{;'S)T;'S;=`)i<%lO)T~)YTP~OY)TZ])T^;'S)T;'S;=`)i<%lO)T~)lP;=`<%l)T~)tVP~OY)TZ])T^s)Tst*Zt;'S)T;'S;=`)i<%lO)T~*bTQ~P~OY*ZZ]*Z^;'S*Z;'S;=`*q<%lO*Z~*tP;=`<%l*Z~*|O!P~f+V^ZS!S`zQXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![.Z!_!`$q!c!},R#R#S,R#T#o,R#o#p$q#q#r$qf,[^ZS!S`zQXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![,R!_!`$q!c!},R#R#S,R#T#o,R#o#p$q#q#r$qd-_^ZS!S`XY$qpq$qrs$quv$qwx$q}!O-W!O!P-W!Q![-W!_!`$q!c!}-W#R#S-W#T#o-W#o#p$q#q#r$qf.f^ZS!S`!QQzQXY$qpq&zrs$quv$qwx$q}!O,R!O!P/b!Q![.Z!_!`$q!c!},R#R#S,R#T#o,R#o#p$q#q#r$qf/k^ZS!S`!QQXY$qpq$qrs$quv$qwx$q}!O-W!O!P-W!Q![/b!_!`$q!c!}-W#R#S-W#T#o-W#o#p$q#q#r$qe0p^{PZS!S`XY$qpq$qrs$quv$qwx$q}!O-W!O!P-W!Q![-W!_!`$q!c!}-W#R#S-W#T#o-W#o#p$q#q#r$q~1qOy~o2Q^ZS!S`^W!QQzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P/b!Q![1q!_!`$q!c!}2|#R#S2|#T#o2|#o#p$q#q#r$qo3Z^ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#o2|#o#p$q#q#r$q~4[O}~o4i_ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#U5h#U#o2|#o#p$q#q#r$qo5u`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#`2|#`#a6w#a#o2|#o#p$q#q#r$qo7U`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#g2|#g#h8W#h#o2|#o#p$q#q#r$qo8e`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#X2|#X#Y9g#Y#o2|#o#p$q#q#r$qo9v^ZS!S`^WeQzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#o2|#o#p$q#q#r$qo;P^ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!};{#R#S2|#T#o2|#o#p$q#q#r$qo<Y^ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![=U!_!`$q!c!}2|#R#S2|#T#o2|#o#p$q#q#r$qo=e^ZS!S`^W`QzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![=U!_!`$q!c!}2|#R#S2|#T#o2|#o#p$q#q#r$qo>n`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#f2|#f#g?p#g#o2|#o#p$q#q#r$qo?}`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#i2|#i#j8W#j#o2|#o#p$q#q#r$q~AUOx~~AZO|~QA^Qqr'}!r!s(ToAq`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#V2|#V#WBs#W#o2|#o#p$q#q#r$qoCQ`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#c2|#c#dDS#d#o2|#o#p$q#q#r$qoDa`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#W2|#W#XEc#X#o2|#o#p$q#q#r$qoEp`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#X2|#X#YFr#Y#o2|#o#p$q#q#r$qoGR^ZS!S`fW^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#o2|#o#p$q#q#r$qoH[`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#b2|#b#cI^#c#o2|#o#p$q#q#r$qoIk`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#V2|#V#WJm#W#o2|#o#p$q#q#r$qoJz`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#`2|#`#aK|#a#o2|#o#p$q#q#r$qoLZ`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#i2|#i#jM]#j#o2|#o#p$q#q#r$qoMj`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#W2|#W#XNl#X#o2|#o#p$q#q#r$qoNy`ZS!S`^WzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#X2|#X#Y! {#Y#o2|#o#p$q#q#r$qo!![^ZS!S`^WTPzQYPXY$qpq&zrs$quv$qwx$q}!O,R!O!P-W!Q![2|!_!`$q!c!}2|#R#S2|#T#o2|#o#p$q#q#r$q",
  tokenizers: [indentation, newlines, 0, 1, 2, 3, 4],
  topRules: {"Program":[0,3]},
  tokenPrec: 388
})

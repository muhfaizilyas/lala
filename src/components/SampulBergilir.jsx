'use client';

import { useEffect, useRef, useState } from 'react';

const gaya = `
.rb-poster[data-rak-showcase]{position:relative;overflow:hidden;isolation:isolate;min-width:0;padding:0;container-type:inline-size;touch-action:pan-y pinch-zoom}
[data-rak-showcase] .rak-panel{position:absolute;inset:0;padding:20px 5%;overflow:hidden;background:repeating-linear-gradient(92deg,transparent 0 3px,rgba(15,31,61,0.035) 4px),#e8effc}
[data-rak-showcase] .rak-stage{position:absolute;inset:10% 0 15%;container-type:size;pointer-events:none}
[data-rak-showcase] .rak-book{position:absolute;left:50%;top:50%;width:min(45cqw,54cqh);aspect-ratio:.69;border-radius:3px 6px 6px 3px;box-shadow:2px 2px 0 #f8fafc,3px 3px 0 #cbd5e1,4px 4px 0 #f1f5f9,5px 5px 0 #94a3b8,10px 14px 20px rgba(15,31,61,0.24);overflow:hidden}
[data-rak-showcase] .rak-rear{background:#1d4ed8;transform:translate(-22%,-51%) rotate(14deg)}
[data-rak-showcase] .rak-front{background:#0f1f3d;transform:translate(-76%,-45%) rotate(-10deg)}
[data-rak-showcase] .rak-book img{position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;padding:0;border:0;margin:0;object-fit:cover}
[data-rak-showcase] .rak-book::after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(15,31,61,0.18);background:linear-gradient(90deg,rgba(15,23,42,0.34),rgba(255,255,255,0.24) 1.8%,rgba(15,23,42,0.2) 4.2%,rgba(255,255,255,0.12) 6%,transparent 9%)}
[data-rak-showcase] .rak-inscription{position:absolute;inset:0;display:grid;align-content:center;padding:12%;font:700 clamp(18px,6.5cqw,34px)/1.12 var(--font-sans,sans-serif);letter-spacing:-0.02em;color:#f8fafc}
.rak-enter{animation:rakPanelIn .64s cubic-bezier(.4,0,.16,1) both}.rak-exit{animation:rakPanelOut .64s cubic-bezier(.4,0,.16,1) both;pointer-events:none}
@keyframes rakPanelIn{from{transform:translateX(calc(var(--dir)*100%))}to{transform:translateX(0)}}
@keyframes rakPanelOut{from{transform:translateX(0)}to{transform:translateX(calc(var(--dir)*-100%))}}
[data-rak-showcase] .rb-label{display:flex;justify-content:space-between;font:600 9px/1.4 ui-monospace,monospace;letter-spacing:.14em;color:#1e3a5f}
[data-rak-showcase] .rak-foot{position:absolute;bottom:12px;left:5%;right:5%;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:4px}
.rak-foot>span:last-child{text-align:right}.rak-controls{display:flex;align-items:center;justify-content:center;flex-wrap:wrap}
[data-rak-showcase] .rak-controls button{appearance:none;display:grid;place-items:center;background:transparent;padding:0;margin:0;border:0;border-radius:50%;width:26px;height:28px;min-width:0;box-shadow:none;color:#0f1f3d;cursor:pointer}
.rak-dot::after{content:'';width:7px;height:7px;box-sizing:border-box;border-radius:50%;border:1.5px solid #475569}.rak-dot[aria-current]::after{width:9px;height:9px;background:#2563eb;border-color:#2563eb}
[data-rak-showcase] button:focus-visible{outline:2px solid #2563eb;outline-offset:-2px}
@container(max-width:380px){[data-rak-showcase] .rb-label{font-size:7px}.rak-foot{bottom:5px}}
@media(prefers-reduced-motion:reduce){.rak-enter{animation:none}.rak-exit{display:none}}
`;

function Jilid({ depan, buku }) {
  return <div className={`rak-book ${depan ? 'rak-front' : 'rak-rear'}`} aria-hidden="true">
    {buku ? <img src={buku.src} alt="" draggable={false}/> : <span className="rak-inscription">{depan ? 'Seni Membaca' : 'Ruang Ilmu'}</span>}
  </div>;
}
const nomor = index => String(index + 1).padStart(2, '0');

export default function SampulBergilir({ buku }) {
  const [urls,setUrls] = useState([]);
  const [slide,setSlide] = useState({i:0,lama:null,arah:1});
  const [jeda,setJeda] = useState(false);
  const [otomatis,setOtomatis] = useState(false);
  const root = useRef(null), sentuhan = useRef(null), fokus = useRef(false);
  const daftar = buku.filter((b,k) => urls.includes(b.src) && buku.findIndex(item=>item.src===b.src)===k);
  const n = daftar.length, i = n ? slide.i % n : 0;
  useEffect(() => {
    const siap = Array.from(root.current.querySelectorAll('[hidden] img')).filter(img=>img.complete && img.naturalWidth>0).map(img=>img.getAttribute('src'));
    if(siap.length)setUrls(prev=>Array.from(new Set([...prev,...siap])));
    const m = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setOtomatis(!m.matches && !document.hidden);
    sync(); m.addEventListener('change',sync); document.addEventListener('visibilitychange',sync);
    return () => {m.removeEventListener('change',sync); document.removeEventListener('visibilitychange',sync)};
  },[]);
  useEffect(() => {
    if(n<2 || jeda || !otomatis) return;
    const t = setTimeout(() => setSlide({i:(i+1)%n,lama:i,arah:1}),5500);
    return () => clearTimeout(t);
  },[n,i,jeda,otomatis]);
  useEffect(() => {
    if(fokus.current){root.current?.querySelector('.rak-panel:not([inert]) [aria-current]')?.focus({preventScroll:true});fokus.current=false;}
  },[i]);
  function pilih(k,arah,keyboard=false){
    setJeda(true);
    if(k===i)return;
    fokus.current=keyboard; setSlide({i:k,lama:i,arah});
  }
  const lama = slide.lama;
  const panel = lama!==null && lama<n && lama!==i ? [lama,i] : [i];
  return <div ref={root} className="rb-poster" data-rak-showcase="" role="region" aria-label="Pilihan sampul buku"
    onTouchStart={e=>{const t=e.touches[0];sentuhan.current=e.touches.length===1?[t.clientX,t.clientY]:null}}
    onTouchCancel={()=>{sentuhan.current=null}}
    onTouchEnd={e=>{const start=sentuhan.current;sentuhan.current=null;if(!start||n<2)return;const t=e.changedTouches[0],dx=t.clientX-start[0];if(Math.abs(dx)>45&&Math.abs(dx)>1.4*Math.abs(t.clientY-start[1])){const arah=dx<0?1:-1;pilih((i+arah+n)%n,arah)}}}>
    <style>{gaya}</style>
    <div hidden>{buku.map(b=><img key={b.id} src={b.src} alt="" onLoad={()=>setUrls(prev=>prev.includes(b.src)?prev:[...prev,b.src])}/>)}</div>
    {panel.map(index=>{const keluar=index!==i, belakang=n>1?(index+1)%n:null;return <div key={index} inert={keluar} aria-hidden={keluar||undefined} className={`rak-panel ${panel.length===1?'':keluar?'rak-exit':'rak-enter'}`} style={{'--dir':slide.arah}}>
      <div className="rb-label" aria-hidden="true"><span>RAKBACA KOLEKSI</span><span>NO. {nomor(index)}</span></div>
      <div className="rak-stage" role="img" aria-label={[daftar[index]?.judul,daftar[belakang]?.judul].filter(Boolean).join(' dan ')||'Dua buku bertumpuk'}>
        <Jilid buku={daftar[belakang]}/><Jilid depan buku={daftar[index]}/>
      </div>
      <div className="rb-label rak-foot"><span>SAMPUL PILIHAN</span><div className="rak-controls" role="group" aria-label="Pilih panel">
        {daftar.map((b,k)=><button type="button" key={b.src} className="rak-dot" aria-current={k===index?'true':undefined} aria-label={`Tampilkan ${b.judul}`} onFocus={()=>setJeda(true)} onClick={e=>pilih(k,k>i?1:-1,e.detail===0)}/>)}
        {n>1&&otomatis&&<button type="button" aria-label={jeda?'Lanjutkan rotasi':'Jeda rotasi'} onClick={()=>setJeda(v=>!v)}><svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d={jeda?'M3 1l8 5-8 5z':'M2 1h3v10H2zM7 1h3v10H7z'}/></svg></button>}
      </div><span>SERI {nomor(index)} / {nomor(belakang??1)}</span></div>
    </div>})}
  </div>;
}

'use strict';
const stages=['Thrown','Trimming / Drying','Bisque Fired','Glazed','Glaze Fired','Finished'];


const forms=['Bowl','Vase','Jar','Mug','Pitcher','Plate','Cylinder','Teapot','Cup','Other'];


const fields=['name','form','stage','thrown','weight','clay','trimmed','bisque','bisqueCone','fired','glazeCone','glaze','notes'];


const $=id=>document.getElementById(id);


let db,pots=[],filter='All',editing=null,images=[];


function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('my-pottery-studio',1);r.onupgradeneeded=()=>r.result.createObjectStore('pots',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}


function tx(mode,action){return new Promise((resolve,reject)=>{const t=db.transaction('pots',mode),s=t.objectStore('pots');action(s);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error)})}


function getAll(){return new Promise((resolve,reject)=>{const r=db.transaction('pots').objectStore('pots').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}


async function refresh(){pots=await getAll();render()}


function escapeHTML(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}


function render(){ $('filters').innerHTML=['All',...stages].map(s=>`<button data-filter="${s}" class="${s===filter?'active':''}">${s}</button>`).join('');const q=$('search').value.toLowerCase();const shown=pots.filter(p=>(filter==='All'||p.stage===filter)&&[p.name,p.form,p.clay,p.glaze,p.notes].join(' ').toLowerCase().includes(q)).sort((a,b)=>String(b.thrown||'').localeCompare(String(a.thrown||'')));$('cards').innerHTML=shown.length?shown.map(p=>`<button class="card" data-id="${escapeHTML(p.id)}"><div class="${p.photos?.length?'':'placeholder'}">${p.photos?.length?`<img alt="${escapeHTML(p.name)}" src="${p.photos[p.photos.length - 1]}">`:'◌'}</div><div><h3>${escapeHTML(p.name)}</h3><span class="tag">${escapeHTML(p.stage)}</span><p>${escapeHTML(p.form)} · ${escapeHTML(p.clay||'Clay not specified')}</p><p><strong>${p.weight!==''&&p.weight!=null?Number(p.weight).toFixed(2)+' lb':'Weight not entered'}</strong></p>${p.glaze?.trim()?`<p>Glaze: ${escapeHTML(p.glaze)}</p>`:''}</div></button>`).join(''):'<div class="empty">No pots found. Tap “New pot” to begin.</div>';document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render()});document.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>openEditor(b.dataset.id))}


function renderPhotos(){$('photos').innerHTML=images.map((src,i)=>`<div class="photo"><img alt="Pot photograph ${i+1}" src="${src}"><button type="button" data-remove="${i}" aria-label="Remove photograph">×</button></div>`).join('');document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{images.splice(Number(b.dataset.remove),1);renderPhotos()})}


function openEditor(id=null){editing=id;const p=pots.find(x=>x.id===id)||{name:'',form:'Bowl',stage:'Thrown',thrown:new Date().toLocaleDateString('en-CA'),weight:'',bisqueCone:'5',glazeCone:'10',photos:[]};fields.forEach(k=>$(k).value=p[k]??'');images=[...(p.photos||[])];renderPhotos();$('photoInput').value='';$('editTitle').textContent=id?'Edit pot':'New pot';$('delete').hidden=!id;$('editor').showModal()}


function fileToDataURL(f){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(f)})}


$('photoInput').addEventListener('change',async e=>{for(const f of e.target.files){if(!f.type.startsWith('image/'))continue;images.push(await fileToDataURL(f))}renderPhotos();e.target.value=''});


$('potForm').onsubmit=async e=>{e.preventDefault();const p={id:editing||crypto.randomUUID(),photos:[...images]};fields.forEach(k=>p[k]=$(k).value);try{await tx('readwrite',s=>s.put(p));$('editor').close();await refresh()}catch(err){alert('Could not save this pot. Device storage may be full. '+err.message)}};


$('delete').onclick=async()=>{if(!editing||!confirm('Delete this pot and its photos?'))return;await tx('readwrite',s=>s.delete(editing));$('editor').close();await refresh()};


$('new').onclick=()=>openEditor();$('close').onclick=()=>$('editor').close();$('search').oninput=render;


function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}


$('backup').onclick=async()=>{try{const data={app:'My Pottery Studio',version:1,exportedAt:new Date().toISOString(),pots:await getAll()};const blob=new Blob([JSON.stringify(data)],{type:'application/json'});const name='pottery-studio-backup-'+new Date().toISOString().slice(0,10)+'.json';const file=new File([blob],name,{type:'application/json'});if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'My Pottery Studio Backup'});return}catch(err){if(err.name==='AbortError')return}}download(blob,name);alert('Backup downloaded. Save the file to iCloud Drive using Files or the share menu.')}catch(err){alert('Backup failed: '+err.message)}};


$('restore').onclick=()=>$('restoreFile').click();


$('restoreFile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const data=JSON.parse(await f.text());if(data.app!=='My Pottery Studio'||!Array.isArray(data.pots)||data.version!==1)throw Error('Not a recognized studio backup');if(!data.pots.every(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&Array.isArray(p.photos)))throw Error('Invalid pottery record');if(!confirm(`Restore ${data.pots.length} pots? This will REPLACE all ${pots.length} pots currently on this device. Make a backup first.`))return;await tx('readwrite',s=>{s.clear();data.pots.forEach(p=>s.put(p))});await refresh();alert('Restore complete. Check pot photos and details.')}catch(err){alert('Restore failed: '+err.message)}};


(async()=>{try{db=await openDB();$('form').innerHTML=forms.map(x=>`<option>${x}</option>`).join('');$('stage').innerHTML=stages.map(x=>`<option>${x}</option>`).join('');await refresh();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{})}catch(err){alert('Local storage could not start: '+err.message)}})();

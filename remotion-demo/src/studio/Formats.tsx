import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { saidAt } from '../formats/timeline';
import { body } from '../formats/theme';
import { asset, clamp, panel, Shell, smallStyle, themes, titleStyle, useStudio } from './shared';
import type { CarouselSlideProps, Chart, ChartStoryProps, ChatQAProps, JourneyProps, KineticTypeProps, MechanismProps, MythFactProps, NewsDeskProps, PodcastWaveProps, VersusProps } from './types';
import { BRAND } from '../brand';

// Mọi chuyển động phụ thuộc frame, giữ nguyên timeline lời nói và âm thanh.
const inset = { padding: '24px 136px 24px 64px' };
export const KineticType = (props: KineticTypeProps) => {
  const s = useStudio(props, props.phrases);
  const colors = ['#FFF3C9', '#D1EAE3', '#F7D8CB', '#DDD8F5'];
  const words = s.beat.label.split(/\s+/);
  const groups = Array.from({length: Math.ceil(words.length / 4)}, (_, i) => words.slice(i * 4, i * 4 + 4));
  const end = s.starts[s.index + 1] ?? s.length;
  const group = Math.min(groups.length - 1, Math.floor(clamp(s.since / Math.max(1, end - s.starts[s.index])) * groups.length));
  const theme = {...themes.kinetic, bg: colors[(s.cutIndex + group) % colors.length]};
  return <Shell props={props} state={s} theme={theme} label="" source={s.beat.source} captions={false}>
    <div style={{...inset,height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column',justifyContent:'space-evenly',alignItems:'center',textAlign:'center'}}>
      {groups[group].map((word,i)=><div key={`${s.index}-${group}-${i}`} style={{fontSize:Math.min(260,Math.max(150,1200/word.length)),lineHeight:1.02,fontWeight:900,color:i%2?theme.accent:theme.ink,transform:`translateY(${Math.sin(s.frame/18)*6}px)`}}>{word}</div>)}
    </div>
  </Shell>;
};

const focuses = { overview: [440, 400, 1], epidermis: [440, 150, 1.65], dermis: [440, 650, 1.4], follicle: [440, 470, 1.65], sebum: [580, 430, 1.9] } as const;
export const Mechanism = (props: MechanismProps) => {
  const s = useStudio(props, props.scenes);
  const a = focuses[props.scenes[Math.max(0,s.index-1)].focus], b = focuses[s.beat.focus];
  const drift=Math.sin(s.since/1200);
  const x=a[0]+(b[0]-a[0])*s.p+drift*25, y=a[1]+(b[1]-a[1])*s.p, z=(a[2]+(b[2]-a[2])*s.p)*(1+0.08*Math.sin(s.since/1600));
  return <Shell props={props} state={s} theme={themes.mechanism} label="Sơ đồ cơ chế · minh hoạ" source={s.beat.source}>
    <svg style={{position:"absolute",top:180}} width="1080" height="1020" viewBox="0 0 1080 1150">
      <g transform={`translate(510 540) scale(${z}) translate(${-x} ${-y})`}>
        <path d="M-600 130 Q0 70 300 130 T1500 130 V300 H-600Z" fill="#E9B58E" />
        <path d="M-600 300 H1500 V1600 H-600Z" fill="#F4D4C9" />
        <path d="M370 130 Q415 170 410 250 L390 650 Q440 790 490 650 L470 250 Q465 170 510 130" fill="#BB8066" stroke="#6C4337" strokeWidth="8" />
        <path d="M440 700 L440 200" stroke="#463429" strokeWidth="18" strokeLinecap="round" />
        <path d="M475 390 C590 290 700 400 610 480 C550 520 510 470 475 460Z" fill="#DBAC43" stroke="#6C4337" strokeWidth="5" />
        {s.beat.items.map((item,i) => item === 'uv' ? <g key={item}>{[0,1,2,3,4].map(j=><g key={j}><path d={`M${120+j*150} -150 L${170+j*150} ${j%2?720:290}`} stroke="#967013" strokeWidth="10" opacity=".6"/><circle cx={120+j*150+((s.frame*5+j*90)%850)*50/870} cy={-150+(s.frame*5+j*90)%850} r="15" fill="#FFF09B"/></g>)}</g> : item === 'inflammation' ? <circle key={item} cx="440" cy="600" r={90+Math.sin(s.frame/8)*15} fill="#A92C3C" opacity=".35" /> : <g key={item} fill={item==='active'?'#005B48':item==='bacteria'?'#792D61':'#A37717'}>{Array.from({length:10},(_,j)=><ellipse key={j} cx={(item==='sebum'?550:400)+Math.sin(s.frame/20+j)*55} cy={item==='active'?((s.frame*3+j*65)%700):350+j*24+Math.sin(s.frame/16+i)*12} rx="12" ry={item==='bacteria'?7:16} />)}</g>)}
        {[[170,210,'Biểu bì',320,210],[130,800,'Trung bì',330,740],[620,650,'Nang lông',475,600],[690,310,'Tuyến bã',590,410]].map(([lx,ly,label,tx,ty])=><g key={String(label)}><path d={`M${lx} ${Number(ly)+12} L${tx} ${ty}`} stroke="#254A3F" strokeWidth="3" /><text x={lx} y={ly} fontSize="44" fill="#173D32" paintOrder="stroke" stroke="#FFF" strokeWidth="5">{label}</text></g>)}
      </g>
    </svg>
    <div style={{ position:'absolute', top:30, left:64, width:860, fontSize:64, fontWeight:800 }}>{s.beat.label}</div>
  </Shell>;
};

const ChartView = ({chart,p,focus,color,height}:{chart:Chart;p:number;focus:number;color:string;height:number}) => {
  if (!chart.values.length || chart.values.length>5 || chart.values.some(v=>v.value<0 || !Number.isFinite(v.value))) throw new Error('Biểu đồ cần 1–5 giá trị hữu hạn, không âm.');
  const max=Math.max(1,...chart.values.map(v=>v.value)), selected=Math.min(Math.max(0,focus),chart.values.length-1);
  const v=chart.values[selected];
  const progress=(i:number)=>clamp(p*chart.values.length-i);
  return <div style={{height,position:'relative'}}>
    <div style={{fontSize:44,fontWeight:700}}>{chart.title}</div>
    <div style={{fontSize:160,fontWeight:900,color,lineHeight:1.1}}>{(v.value*progress(selected)).toLocaleString('vi-VN',{maximumFractionDigits:1})}{chart.unit}</div>
    <svg viewBox="0 0 880 820" width="100%" height={Math.max(340,height-225)} preserveAspectRatio="none">
      {[0,1,2,3,4].map(i=><line key={i} x1="10" x2="860" y1={80+i*150} y2={80+i*150} stroke="#C4D0E5" strokeWidth="2" />)}
      {chart.kind==='line' ? <path d={`M${chart.values.map((v,i)=>`${60+i*730/Math.max(1,chart.values.length-1)},${700-v.value/max*600}`).join(' L')}`} fill="none" stroke={color} strokeWidth="12" pathLength="1" strokeDasharray="1" strokeDashoffset={1-(selected+p)/chart.values.length} /> : chart.values.map((v,i)=>chart.kind==='bar'?<rect key={i} x="10" y={i*680/chart.values.length+30} width={v.value/max*830*progress(i)} height={Math.min(100,480/chart.values.length)} fill={color} rx="12" />:<rect key={i} x={30+i*840/chart.values.length} y={700-v.value/max*620*progress(i)} width={Math.min(125,600/chart.values.length)} height={v.value/max*620*progress(i)} fill={color} rx="12" />)}
      {chart.values.map((v,i)=><text key={i} x={chart.kind==='bar'?20:35+i*840/chart.values.length} y={chart.kind==='bar'?i*680/chart.values.length+25:770} fontSize="44" fill="#20212A">{v.label}</text>)}
    </svg>
  </div>;
};
export const ChartStory = (props:ChartStoryProps) => {
  const s=useStudio(props,props.scenes);
  if(s.beat.charts.length>3) throw new Error('Cần từ một đến ba biểu đồ.');
  const chartIndex=Math.min(s.beat.charts.length-1,Math.floor(clamp(s.since/Math.max(1,(s.starts[s.index+1]??s.length)-s.starts[s.index]))*s.beat.charts.length));
  return <Shell props={props} state={s} theme={themes.chart} label="Câu chuyện số liệu" source={s.beat.source}><div style={{...inset,paddingTop:0,paddingBottom:0}}><h1 style={{...titleStyle,fontSize:s.beat.charts.length?64:140,marginBottom:12,marginTop:s.beat.charts.length?0:230}}>{s.beat.label}</h1>{s.beat.charts.length>0 && <ChartView chart={s.beat.charts[chartIndex]} p={s.p} focus={s.beat.focusIndex??0} color={themes.chart.accent} height={1040}/>}</div></Shell>;
};

export const Versus = (props:VersusProps) => {
  const s=useStudio(props,props.criteria);
  return <Shell props={props} state={s} theme={themes.versus} label="Đối chiếu theo tiêu chí" source={s.beat.source}>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',height:'100%'}}>{[props.left,props.right].map((name,i)=><div key={i} style={{background:i?'#183C51':'#F2BD84',color:i?'#FFF':'#392618',padding:'70px 48px',boxSizing:'border-box',display:'flex',flexDirection:'column',justifyContent:'space-between',overflow:'hidden'}}>
      <h2 style={{fontSize:64,margin:0,minHeight:210}}>{name}</h2>
      <div key={s.index} style={{transform:`translateX(${(1-s.p)*(i?500:-500)}px)`,minHeight:650}}><div style={{fontSize:48,marginBottom:80}}>{s.beat.label}</div><div style={{fontSize:72,fontWeight:800,lineHeight:1.3,overflowWrap:'normal'}}>{(i?s.beat.rightText:s.beat.leftText).split(/(\d+,\d+)/).map((part,j)=><span key={j} style={{display:/\d+,\d+/.test(part)?'block':'inline',whiteSpace:/\d+,\d+/.test(part)?'nowrap':undefined}}>{part}</span>)}</div></div>
    </div>)}</div>
  
  </Shell>;
};

export const MythFact = (props:MythFactProps) => {
  const s=useStudio(props,props.rounds), reveal=saidAt(s.words,s.beat.revealPhrase,s.beat.revealNth);
  if(reveal-s.starts[s.index]<3000) throw new Error('Đáp án phải neo sau câu hỏi ít nhất 3 giây để đủ thời gian đoán.');
  const shown=s.ms>=reveal, turn=clamp((s.ms-reveal)/750), stamp=clamp((s.ms-reveal-500)/350);
  const advice = (props.cards ?? []).map(c => ({ at: c.atPhrase ? saidAt(s.words, c.atPhrase, c.nth) : reveal + (c.afterRevealMs ?? 0), text: c.text }));
  const card = [...advice].reverse().find(c => s.ms >= c.at);
  const theme={...themes.myth,bg:shown?'#D9EDE3':'#F5EAFE'};
  return <Shell props={props} state={s} theme={theme} label="Lời đồn hay sự thật?" source={shown?s.beat.source:undefined}>
    <div style={{...inset,perspective:1800,height:'100%'}}><div style={{position:'relative',height:1060,transformStyle:'preserve-3d',transform:`rotateY(${turn*180}deg)`}}>
      <div style={{...panel,position:'absolute',inset:0,backfaceVisibility:'hidden',background:'#E8D4F1',display:'flex',flexDirection:'column',justifyContent:'space-around'}}><h1 style={titleStyle}>{s.beat.label}</h1><div style={{fontSize:340,lineHeight:1,textAlign:'center',fontWeight:900,color:theme.accent}}>{Math.max(1,Math.ceil((reveal-s.ms)/1000))}</div><div style={{fontSize:44,textAlign:'center'}}>Bạn chọn đáp án nào?</div></div>
      <div style={{...panel,position:'absolute',inset:0,backfaceVisibility:'hidden',transform:'rotateY(180deg)',display:'flex',flexDirection:'column',justifyContent:'center',gap:90}}><div style={{fontSize:80,fontWeight:900,color:'#005B48',border:'12px solid',padding:20,textAlign:'center',opacity:stamp,transform:`translateY(${(1-stamp)*-220}px) scale(${1+(1-stamp)*1.4}) rotate(${-7+Math.sin(s.frame*2)*(1-stamp)*5}deg)`}}>{s.beat.verdict}</div><div key={card?.text} style={{fontSize:100,fontWeight:800,lineHeight:1.2,textAlign:"center",transform:`translateY(${Math.sin(s.frame/20)*8}px)`}}>{card?.text??s.beat.explanation}</div></div>
    </div></div>
  </Shell>;
};

export const ChatQA = (props:ChatQAProps) => {
  const s=useStudio(props,props.messages), typing=s.since<650;
  // Các hàng có chiều cao xác định để cuộn liên tục và không chồng tin nhắn.
  const rowHeight=(text:string)=>Math.max(470,Math.ceil(text.length/22)*76+150);
  const offsets=props.messages.map((_,i)=>props.messages.slice(0,i).reduce((n,m)=>n+rowHeight(m.label)+32,0));
  const before=s.index?Math.max(0,offsets[s.index-1]+rowHeight(props.messages[s.index-1].label)-980):0;
  const target=Math.max(0,offsets[s.index]+rowHeight(s.beat.label)-980);
  return <Shell props={props} state={s} theme={themes.chat} label="Câu hỏi minh hoạ" source={s.beat.source}>
    <div style={{...inset,height:'100%',background:'#D5EBEE'}}><div style={{fontSize:48,fontWeight:800,height:100}}>Hỏi đáp cùng {BRAND.name} <span style={{color:'#006371'}}>●</span></div><div style={{height:1010,overflow:'hidden'}}><div style={{transform:`translateY(${-before-(target-before)*s.p}px)`,display:'flex',flexDirection:'column',gap:32}}>{props.messages.slice(0,s.index+1).map((m,i)=><div key={i} style={{boxSizing:'border-box',height:rowHeight(m.label),flexShrink:0,width:780,alignSelf:m.role==='question'?'flex-start':'flex-end',borderRadius:m.role==='question'?'36px 36px 36px 4px':'36px 36px 4px 36px',background:m.role==='question'?'#FFF':'#006371',color:m.role==='question'?'#20212A':'#FFF',padding:32}}><div style={{fontSize:44,marginBottom:22}}>{m.role==='question'?'Câu hỏi':'Giải thích'}</div>{i===s.index&&typing?<div style={{display:'flex',gap:20,paddingTop:40}}>{[0,1,2].map(j=><span key={j} style={{width:24,height:24,borderRadius:'50%',background:'currentColor',transform:`translateY(${Math.sin(s.frame/4-j)*12}px)`}}/>)}</div>:<div style={{fontSize:60,lineHeight:1.26,fontWeight:650}}>{m.label}</div>}</div>)}</div></div></div>
  </Shell>;
};

export const Journey = (props:JourneyProps) => {
  const s=useStudio(props,props.milestones);
  const cutStart=s.cuts[s.cutIndex];
  const local=clamp((s.ms-cutStart)/650);
  const parts=s.beat.note.split(/(?<=[;。])\s*|;\s*/);
  const cutWords=s.words.filter(w=>w.startMs>=cutStart && w.startMs<cutStart+2400).map(w=>w.text).join(' ');
  const note=s.beat.week==='Bắt đầu' && cutStart>s.starts[s.index] ? cutWords : parts[(s.cutIndex % parts.length)];
  return <Shell props={props} state={s} theme={themes.journey} label="Hành trình theo thời gian" source={s.beat.source}>
    <svg width="1080" height="1200" style={{position:'absolute'}}><path d="M110 20 C210 270 20 490 110 700 S210 1000 110 1180" fill="none" stroke="#798644" strokeWidth="14"/><circle cx={110+Math.sin(s.frame/35)*35} cy={100+((s.ms-cutStart)/6)%950} r="30" fill="#4B5B11"/></svg>
    <div style={{position:'absolute',left:270,top:70,width:660,height:1030,display:'flex',flexDirection:'column',justifyContent:'space-around',transform:`translateY(${(1-local)*40}px)`}}><div style={{fontSize:100,fontWeight:900,color:'#4B5B11'}}>{s.beat.week}</div><h1 style={{...titleStyle,fontSize:80}}>{s.beat.label}</h1><div style={{fontSize:64,lineHeight:1.3}}>{note}</div></div>
  </Shell>;
};

export const NewsDesk = (props:NewsDeskProps) => {
  const s=useStudio(props,props.stories);
  const cards=[s.beat.label,s.beat.studyType,s.beat.sampleSize];
  const end=s.starts[s.index+1]??s.length;
  const index=Math.min(2,Math.floor(clamp(s.since/Math.max(1,end-s.starts[s.index]))*3));
  return <Shell props={props} state={s} theme={themes.news} label="Bản tin nghiên cứu" source={s.beat.source}>
    <div style={{...inset,height:1050,display:'flex',flexDirection:'column',justifyContent:'space-around'}}><div style={{fontSize:44,color:'#9F2341'}}>{BRAND.name} · Nghiên cứu</div><div key={`${s.index}-${index}`} style={{...panel,fontSize:88,lineHeight:1.2,fontWeight:800,minHeight:540,display:'flex',alignItems:'center',textAlign:'center',transform:`translateX(${Math.sin(s.frame/24)*5}px)`}}>{cards[index]}</div><div style={{fontSize:76,fontWeight:900,color:'#9F2341'}}>{s.beat.pmid?`PMID ${s.beat.pmid}`:'Chưa cung cấp PMID'}</div></div>
    <div style={{position:'absolute',left:0,bottom:0,width:1080,height:76,background:'#9F2341',color:'#FFF',overflow:'hidden',display:'flex',alignItems:'center'}}><div style={{fontSize:44,whiteSpace:'nowrap',transform:`translateX(${-(s.frame*3)%1800}px)`}}>{[0,1,2,3].map(i=><span key={i} style={{display:'inline-block',width:1800,paddingLeft:64}}>{s.beat.headline}</span>)}</div></div>
  </Shell>;
};

export const PodcastWave = (props:PodcastWaveProps) => {
  const s=useStudio(props,props.chapters), data=useAudioData(asset(props.audio));
  let elapsed=0,sourceMs=0;
  for(const segment of props.segments){const duration=segment.toMs-segment.fromMs;if(s.ms<elapsed+duration){sourceMs=segment.fromMs+s.ms-elapsed;break;}elapsed+=duration;}
  const samples=data?visualizeAudio({audioData:data,frame:Math.round(sourceMs/1000*s.fps),fps:s.fps,numberOfSamples:64,smoothing:true}):Array.from({length:64},()=>0);
  const peak=Math.max(0,...samples);
  const speaking=s.words.some(w=>s.ms>=w.startMs && s.ms<=w.endMs+100);
  const amplitudes=samples.map((v,i)=>peak>0.0001?Math.max(.04,v/peak):speaking?.18+.82*Math.abs(Math.sin(s.frame*.19+i*.71)*Math.cos(i*.31+s.frame*.07)):.03);
  const end=s.starts[s.index+1]??s.length, progress=clamp(s.since/Math.max(1,end-s.starts[s.index]));
  return <Shell props={props} state={s} theme={themes.podcast} label="Lắng nghe và suy ngẫm" source={s.beat.source}>
    <div style={{...inset,height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column',justifyContent:'space-between'}}><div style={{fontSize:44,color:themes.podcast.accent}}>Chương {s.index+1} · {s.beat.label}</div><svg viewBox="0 0 880 440" width="880" height="440" style={{flexShrink:0}}>{amplitudes.map((v,i)=><rect key={i} x={i*13.5} y={220-v*215} width="8" height={v*430} rx="4" fill={themes.podcast.accent}/>)}</svg><div style={{fontSize:88,lineHeight:1.15,fontWeight:800,textAlign:'center'}}>“{s.beat.quote}”</div><div style={{display:'flex',gap:12}}>{props.chapters.map((_,i)=><div key={i} style={{flex:1,background:'#C7BDD9',height:18}}><div style={{width:`${i<s.index?100:i===s.index?progress*100:0}%`,height:'100%',background:themes.podcast.accent}}/></div>)}</div><div style={{fontSize:44}}>{s.index+1} / {props.chapters.length}</div></div>
  </Shell>;
};

export const CarouselSlide = (props: CarouselSlideProps) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: '#FFF7E8', color: '#252326', padding: '64px 120px 64px 64px', fontFamily: body }}>
    <div style={{ ...smallStyle, color: '#774116' }}>{BRAND.name} · {props.page}/{props.pages}</div>
    <h1 style={{ ...titleStyle, fontSize: 86, marginTop: 60 }}>{props.title}</h1>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34, transform: `translateY(${Math.sin(frame / 40) * 2}px)` }}>{props.content.map((line, i) => <div key={i} style={{ ...panel, ...smallStyle, borderLeft: '8px solid #774116' }}>{line}</div>)}</div>
    <div style={{ position: 'absolute', top: 1160, left: 64, width: 880, fontSize: 32, lineHeight: 1.3 }}>{props.source}</div>
    {props.aiVoice && <div style={{ ...smallStyle, position: 'absolute', top: 1260 }}>Giọng đọc AI</div>}
  </AbsoluteFill>;
};

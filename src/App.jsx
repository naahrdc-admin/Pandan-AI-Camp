import { useState, useEffect, useRef } from "react";
import { db } from "./db.js";

const uid=()=>Math.random().toString(36).slice(2,9);
const today=()=>new Date().toISOString().split('T')[0];
const CLRS=['#16a34a','#2563eb','#d97706','#dc2626','#7c3aed','#0891b2','#be185d','#0d9488'];
const getClr=s=>CLRS[(s?.charCodeAt(0)||65)%CLRS.length];
const compressImg=file=>new Promise(res=>{const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');const MAX=800;let{width:w,height:h}=img;if(w>MAX){h=Math.round(h*MAX/w);w=MAX}c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);res(c.toDataURL('image/jpeg',.72))};img.src=e.target.result};r.readAsDataURL(file)});

/* ── Translations ────────────────────────────── */
const T={
  zh:{
    app:'班兰AI智造营',tag:'让AI学习充满乐趣',
    teacher:'老师',student:'学生',
    teacherLogin:'老师登录',teacherDesc:'管理课堂、学生与作品',studentDesc:'参与游戏、上传作品、发表感想',
    pwd:'密码',pwdPh:'输入密码',loginBtn:'登录',
    wrongPwd:'密码错误，请重试',defPwd:'默认密码：pandan2024',
    resetPwd:'忘记密码？点此重置为默认',resetPwdDone:'✅ 密码已重置为 pandan2024',
    pickName:'选择你的名字',noStudentsYet:'老师还没有添加学生名单',
    back:'返回',logout:'退出',
    n:{home:'首页',students:'学生',classes:'课堂',works:'作品',games:'游戏',settings:'设置'},
    totalS:'位学生',totalC:'节课堂',totalW:'件作品',
    recent:'最近课堂',noRecent:'暂无课堂记录',quick:'快速入口',
    addS:'添加学生',editS:'编辑学生',sList:'学生名单',
    name:'姓名',grade:'年级/班级',hobby:'爱好',favItem:'喜爱的物品',notes:'备注',
    noStudents:'暂无学生，点击右上角添加',
    addC:'添加课堂',editC:'编辑课堂',cList:'课堂记录',
    date:'日期',topic:'课程主题',content:'授课内容',perf:'课堂表现',att:'出勤',
    present:'出席',absent:'缺席',noClasses:'暂无课堂记录',
    addW:'添加作品',wList:'作品集',
    wTitle:'作品标题',wDesc:'描述',wStu:'学生',wCls:'关联课堂（选填）',
    wImg:'上传图片',wLink:'作品链接',noWorks:'暂无作品',
    stuUploadW:'上传我的作品',stuWTitle:'作品标题',stuWDesc:'描述（选填）',
    quiz:'📝 小测验',webapps:'🌐 小游戏',
    qzTitle:'小测验',waTitle:'Web App 游戏',
    start:'开始',reset:'重置',next:'下一题',finish:'完成',
    qQ:'题目',reveal:'揭晓答案',results:'测验成绩',addQ:'+ 添加题目',
    addApp:'添加游戏链接',editApp:'编辑',appName:'游戏名称',appUrl:'游戏网址',appDesc:'说明（选填）',appIcon:'图标',
    noApps:'还没有游戏链接，点击右上角添加',openApp:'🚀 点击游玩',
    hi:'你好',waitGame:'等待老师启动小测验...',noGame:'暂时没有测验',
    reflection:'课堂感想',reflPh:'今天学了什么？有什么发现？觉得难的地方是什么？',submit:'提交',submitted:'✅ 已提交！',
    reflHints:['💡 今天学了什么新知识？','🤔 你觉得最有趣的部分是什么？','😅 有什么地方你觉得难？','🚀 你想在下一节课学什么？','🌟 你今天最开心的是什么？'],
    myWorks:'我的作品',noMyWorks:'你还没有作品，快来上传第一个吧！',allRefl:'历史感想',
    pwdTitle:'密码设置',changePwd:'修改密码',
    curPwd:'当前密码',newPwd:'新密码',cfmPwd:'确认新密码',
    pwdOk:'✅ 密码修改成功！',pwdMismatch:'两次密码不一致',pwdWrong:'当前密码错误',
    langTitle:'语言设置',
    save:'保存',cancel:'取消',del:'删除',edit:'编辑',
    confirmDel:'确定要删除吗？',all:'全部',close:'关闭',search:'搜索',loading:'加载中...',
    startGame:'启动测验',stopGame:'停止',responses:'答题情况',howTo:'使用说明',
    uploadOk:'✅ 作品已上传！',
    notAnswered:'未作答',waitReveal:'已提交，等待老师揭晓答案...',
    pleaseAnswer:'👆 请选择你的答案',
    saveQuiz:'保存题目',quizSaved:'✅ 题目已保存',
    clearQuiz:'清空题目',
    resumeGame:'恢复进行中的测验',
  },
  en:{
    app:'Pandan AI Creative Camp',tag:'Making AI Learning Fun',
    teacher:'Teacher',teacherDesc:'Manage classes, students & works',studentDesc:'Play games, upload works & share reflections',
    pwd:'Password',pwdPh:'Enter password',loginBtn:'Login',
    wrongPwd:'Wrong password, please try again',defPwd:'Default: pandan2024',
    resetPwd:'Forgot password? Reset to default',resetPwdDone:'✅ Password reset to pandan2024',
    pickName:'Choose your name',noStudentsYet:'No students added yet.',
    back:'Back',logout:'Logout',
    n:{home:'Home',students:'Students',classes:'Classes',works:'Works',games:'Games',settings:'Settings'},
    totalS:'Students',totalC:'Classes',totalW:'Works',
    recent:'Recent Classes',noRecent:'No class records',quick:'Quick Access',
    addS:'Add Student',editS:'Edit Student',sList:'Students',
    name:'Name',grade:'Grade',hobby:'Hobby',favItem:'Favourite Item',notes:'Notes',
    noStudents:'No students yet.',
    addC:'Add Class',editC:'Edit Class',cList:'Classes',
    date:'Date',topic:'Topic',content:'Content',perf:'Performance',att:'Attendance',
    present:'Present',absent:'Absent',noClasses:'No class records.',
    addW:'Add Work',wList:'Gallery',
    wTitle:'Title',wDesc:'Description',wStu:'Student',wCls:'Linked Class',
    wImg:'Upload Image',wLink:'Work Link',noWorks:'No works yet.',
    stuUploadW:'Upload My Work',stuWTitle:'Work Title',stuWDesc:'Description (optional)',
    quiz:'📝 Quiz',webapps:'🌐 Games',
    qzTitle:'Quiz',waTitle:'Web App Games',
    start:'Start',reset:'Reset',next:'Next',finish:'Finish',
    qQ:'Question',reveal:'Reveal',results:'Results',addQ:'+ Add Question',
    addApp:'Add Game',editApp:'Edit',appName:'Name',appUrl:'URL',appDesc:'Description',appIcon:'Icon',
    noApps:'No game links yet.',openApp:'🚀 Play',
    hi:'Hi',waitGame:'Waiting for teacher to start quiz...',noGame:'No active quiz',
    reflection:'Reflection',reflPh:'What did you learn? What was fun? What was hard?',submit:'Submit',submitted:'✅ Submitted!',
    reflHints:['💡 What did you learn today?','🤔 What was the most interesting part?','😅 Was there anything difficult?','🚀 What do you want to learn next?','🌟 What made you happy today?'],
    myWorks:'My Works',noMyWorks:'No works yet.',allRefl:'Past Reflections',
    pwdTitle:'Password',changePwd:'Change Password',
    curPwd:'Current Password',newPwd:'New Password',cfmPwd:'Confirm',
    pwdOk:'✅ Changed!',pwdMismatch:"Passwords don't match",pwdWrong:'Wrong current password',
    langTitle:'Language',
    save:'Save',cancel:'Cancel',del:'Delete',edit:'Edit',
    confirmDel:'Are you sure?',all:'All',close:'Close',search:'Search',loading:'Loading...',
    startGame:'Start Quiz',stopGame:'Stop',responses:'Responses',howTo:'How to Use',
    uploadOk:'✅ Work uploaded!',
    notAnswered:'Not answered',waitReveal:'Submitted, waiting for answer...',
    pleaseAnswer:'👆 Choose your answer',
    saveQuiz:'Save Questions',quizSaved:'✅ Saved',clearQuiz:'Clear',
    resumeGame:'Resume Active Quiz',
  }
};

/* ── CSS ─────────────────────────────────────── */
const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka+One&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Nunito',sans-serif!important}
  input,textarea,select,button{font-family:inherit}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .fi{animation:fadeIn .25s ease}
  .fredoka{font-family:'Fredoka One',cursive!important}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#86efac;border-radius:3px}
  @media(max-width:768px){
    .sidebar{display:none!important}
    .bnav{display:flex!important}
    .main-wrap{margin-left:0!important;padding-bottom:80px!important}
    .g3{grid-template-columns:repeat(3,1fr)!important}
    .g2{grid-template-columns:1fr!important}
    #mob-back{display:block!important}
  }
`;
const C={
  card:{background:'#fff',borderRadius:14,boxShadow:'0 2px 14px rgba(0,0,0,.07)',padding:'20px'},
  inp:{width:'100%',padding:'9px 13px',border:'2px solid #e5e7eb',borderRadius:8,fontSize:14,outline:'none',background:'#fff'},
  lbl:{display:'block',fontSize:12.5,fontWeight:700,color:'#6b7280',marginBottom:5},
  fg:{marginBottom:14},
};
const SEL={appearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='2' fill='none'/%3E%3C/svg%3E\")",backgroundRepeat:'no-repeat',backgroundPosition:'right 12px center',paddingRight:36};

/* ── Shared UI ───────────────────────────────── */
const Btn=({children,v='green',size='',full,onClick,disabled,style={}})=>{
  const M={green:{bg:'#16a34a',cl:'#fff',b:'none'},gold:{bg:'#f59e0b',cl:'#1c1917',b:'none'},red:{bg:'#dc2626',cl:'#fff',b:'none'},ghost:{bg:'#f0fdf4',cl:'#16a34a',b:'none'},outline:{bg:'transparent',cl:'#16a34a',b:'2px solid #16a34a'},gray:{bg:'#f3f4f6',cl:'#374151',b:'none'},blue:{bg:'#2563eb',cl:'#fff',b:'none'}};
  const{bg,cl,b}=M[v]||M.green;
  return <button onClick={onClick} disabled={disabled} style={{padding:size==='sm'?'5px 14px':'9px 18px',fontSize:size==='sm'?12:13.5,fontWeight:700,borderRadius:8,cursor:disabled?'default':'pointer',display:'inline-flex',alignItems:'center',gap:6,background:bg,color:cl,border:b,opacity:disabled?.5:1,width:full?'100%':undefined,justifyContent:full?'center':undefined,transition:'all .15s',...style}}>{children}</button>;
};
const Badge=({children,c='green'})=>{
  const M={green:{bg:'#f0fdf4',cl:'#166534'},gold:{bg:'#fffbeb',cl:'#92400e'},red:{bg:'#fef2f2',cl:'#991b1b'},blue:{bg:'#eff6ff',cl:'#1e40af'},gray:{bg:'#f3f4f6',cl:'#374151'},purple:{bg:'#f5f3ff',cl:'#5b21b6'}};
  const{bg,cl}=M[c]||M.green;
  return <span style={{display:'inline-block',padding:'3px 9px',borderRadius:20,fontSize:11.5,fontWeight:700,background:bg,color:cl}}>{children}</span>;
};
function Modal({title,onClose,children,footer}){
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'#fff',borderRadius:18,width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 60px rgba(0,0,0,.25)'}}>
        <div style={{padding:'18px 22px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div className="fredoka" style={{fontSize:19,color:'#064e3b'}}>{title}</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#9ca3af',lineHeight:1,padding:4}}>✕</button>
        </div>
        <div style={{padding:'14px 22px'}}>{children}</div>
        {footer&&<div style={{padding:'0 22px 18px',display:'flex',gap:8,justifyContent:'flex-end'}}>{footer}</div>}
      </div>
    </div>
  );
}
function Empty({icon,text}){return <div style={{textAlign:'center',padding:'50px 20px',color:'#9ca3af'}}><div style={{fontSize:44,marginBottom:10}}>{icon}</div><div style={{fontSize:14,fontWeight:700}}>{text}</div></div>;}
function PH({title,sub,action}){return <div style={{marginBottom:20,display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:10}}><div><div className="fredoka" style={{fontSize:26,color:'#064e3b'}}>{title}</div>{sub&&<div style={{fontSize:13,color:'#6b7280',marginTop:2}}>{sub}</div>}</div>{action}</div>;}
function Avatar({name,size=42}){return <div style={{width:size,height:size,borderRadius:'50%',background:getClr(name),display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Fredoka One',cursive",fontSize:Math.round(size*.4),color:'#fff',flexShrink:0}}>{name?.charAt(0).toUpperCase()}</div>;}

/* ── Lightbox ────────────────────────────────── */
function Lightbox({src,alt,onClose}){
  useEffect(()=>{
    const handler=e=>{if(e.key==='Escape')onClose();};
    document.addEventListener('keydown',handler);
    return()=>document.removeEventListener('keydown',handler);
  },[onClose]);
  return(
    <div onClick={onClose}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16,cursor:'zoom-out'}}>
      <button onClick={onClose} style={{position:'absolute',top:16,right:20,background:'rgba(255,255,255,.15)',border:'none',color:'#fff',fontSize:26,cursor:'pointer',width:44,height:44,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>✕</button>
      <img src={src} alt={alt} onClick={e=>e.stopPropagation()}
        style={{maxWidth:'95vw',maxHeight:'90vh',objectFit:'contain',borderRadius:10,boxShadow:'0 8px 40px rgba(0,0,0,.6)',cursor:'default'}}/>
    </div>
  );
}

/* ══════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════ */
export default function App(){
  const[ready,setReady]=useState(false);
  const[role,setRole]=useState(null);
  const[auth,setAuth]=useState(false);
  const[studentId,setStudentId]=useState(null);
  const[lang,setLang]=useState('zh');
  const[students,setStudents]=useState([]);
  const[classes,setClasses]=useState([]);
  const[works,setWorks]=useState([]);

  useEffect(()=>{
    Promise.all([db.get('p_lang','zh'),db.get('p_stu',[],true),db.get('p_cls',[],true),db.get('p_wrk',[],true)])
      .then(([l,s,c,w])=>{setLang(l);setStudents(s);setClasses(c);setWorks(w);setReady(true);});
  },[]);
  useEffect(()=>{if(ready)db.set('p_lang',lang);},[lang,ready]);
  useEffect(()=>{if(ready)db.set('p_stu',students,true);},[students,ready]);
  useEffect(()=>{if(ready)db.set('p_cls',classes,true);},[classes,ready]);
  useEffect(()=>{if(ready)db.set('p_wrk',works,true);},[works,ready]);
  useEffect(()=>{if(ready)db.set('s_students',students,true);},[students,ready]);

  const t=T[lang];
  if(!ready)return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0fdf4'}}><style>{CSS}</style><div className="fredoka" style={{color:'#16a34a',fontSize:20}}>🌿 加载中...</div></div>);

  return(
    <div style={{minHeight:'100vh',fontFamily:"'Nunito',sans-serif"}}>
      <style>{CSS}</style>
      {!role&&<LandingPage onRole={setRole} lang={lang} setLang={setLang} t={t}/>}
      {role==='teacher'&&!auth&&<TeacherLogin onLogin={()=>setAuth(true)} onBack={()=>setRole(null)} lang={lang} setLang={setLang} t={t}/>}
      {role==='teacher'&&auth&&<TeacherApp students={students} setStudents={setStudents} classes={classes} setClasses={setClasses} works={works} setWorks={setWorks} lang={lang} setLang={setLang} t={t} onLogout={()=>{setAuth(false);setRole(null);}}/>}
      {role==='student'&&!studentId&&<StudentPicker onPick={setStudentId} onBack={()=>setRole(null)} t={t}/>}
      {role==='student'&&studentId&&(()=>{
        const stu=students.find(s=>s.id===studentId)||{id:studentId,name:'?'};
        return <StudentApp student={stu} allWorks={works} setWorks={setWorks} classes={classes} onLogout={()=>{setStudentId(null);setRole(null);}} t={t}/>;
      })()}
    </div>
  );
}

/* ══════════  LANDING  ══════════ */
function LandingPage({onRole,lang,setLang,t}){
  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#064e3b 0%,#065f46 50%,#16a34a 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{textAlign:'center',marginBottom:44}}>
        <div style={{fontSize:64,marginBottom:8}}>🌿</div>
        <div className="fredoka" style={{fontSize:30,color:'#fff'}}>{t.app}</div>
        <div style={{fontSize:14,color:'rgba(255,255,255,.65)',marginTop:6}}>{t.tag}</div>
        <div style={{display:'flex',background:'rgba(255,255,255,.1)',borderRadius:20,padding:4,marginTop:20,width:'fit-content',margin:'20px auto 0'}}>
          {['zh','en'].map(l=><button key={l} onClick={()=>setLang(l)} style={{padding:'6px 20px',border:'none',borderRadius:16,fontSize:13,fontWeight:700,cursor:'pointer',background:lang===l?'#f59e0b':'none',color:lang===l?'#1c1917':'rgba(255,255,255,.7)',transition:'all .2s',fontFamily:'inherit'}}>{l==='zh'?'中文':'English'}</button>)}
        </div>
      </div>
      <div style={{display:'flex',gap:20,flexWrap:'wrap',justifyContent:'center'}}>
        {[{role:'teacher',ic:'👩‍🏫',l:t.teacher,desc:t.teacherDesc,bg:'rgba(255,255,255,.96)',accent:'#064e3b'},{role:'student',ic:'🧒',l:t.student,desc:t.studentDesc,bg:'rgba(245,158,11,.95)',accent:'#1c1917'}].map(r=>(
          <div key={r.role} onClick={()=>onRole(r.role)}
            style={{background:r.bg,borderRadius:20,padding:'32px 36px',width:230,textAlign:'center',cursor:'pointer',boxShadow:'0 10px 40px rgba(0,0,0,.22)',transition:'transform .15s,box-shadow .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='0 18px 50px rgba(0,0,0,.28)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 10px 40px rgba(0,0,0,.22)';}}>
            <div style={{fontSize:52,marginBottom:10}}>{r.ic}</div>
            <div className="fredoka" style={{fontSize:26,color:r.accent,marginBottom:6}}>{r.l}</div>
            <div style={{fontSize:12.5,color:'#4b5563'}}>{r.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════  TEACHER LOGIN  ══════════ */
function TeacherLogin({onLogin,onBack,lang,setLang,t}){
  const[pwd,setPwd]=useState('');
  const[err,setErr]=useState(false);
  const[resetMsg,setResetMsg]=useState('');

  const tryLogin=async()=>{
    const stored=await db.get('p_pwd','pandan2024');
    if(pwd===stored)onLogin();
    else{setErr(true);setPwd('');setTimeout(()=>setErr(false),3000);}
  };

  // ✅ Reset password to default
  const resetPassword=async()=>{
    await db.set('p_pwd','pandan2024');
    setResetMsg(t.resetPwdDone);
    setPwd('');
    setTimeout(()=>setResetMsg(''),4000);
  };

  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#064e3b,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',borderRadius:20,padding:'36px 30px',width:'100%',maxWidth:360,boxShadow:'0 20px 60px rgba(0,0,0,.28)'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'#9ca3af',fontSize:13,cursor:'pointer',marginBottom:16,display:'flex',alignItems:'center',gap:5,fontFamily:'inherit',fontWeight:700}}>← {t.back}</button>
        <div style={{textAlign:'center',marginBottom:24}}><div style={{fontSize:44,marginBottom:6}}>👩‍🏫</div><div className="fredoka" style={{fontSize:21,color:'#065f46'}}>{t.teacherLogin}</div></div>
        <div style={{display:'flex',background:'#f3f4f6',borderRadius:20,padding:3,marginBottom:18}}>
          {['zh','en'].map(l=><button key={l} onClick={()=>setLang(l)} style={{flex:1,padding:'5px',border:'none',borderRadius:17,fontSize:12,fontWeight:700,cursor:'pointer',background:lang===l?'#f59e0b':'none',color:lang===l?'#1c1917':'#6b7280',transition:'all .2s',fontFamily:'inherit'}}>{l==='zh'?'中文':'English'}</button>)}
        </div>
        {err&&<div style={{background:'#fef2f2',color:'#dc2626',padding:'9px 13px',borderRadius:8,fontSize:13,fontWeight:600,marginBottom:14}}>⚠️ {t.wrongPwd}</div>}
        {resetMsg&&<div style={{background:'#f0fdf4',color:'#166534',padding:'9px 13px',borderRadius:8,fontSize:13,fontWeight:600,marginBottom:14}}>{resetMsg}</div>}
        <div style={C.fg}><label style={C.lbl}>{t.pwd}</label><input style={C.inp} type="password" value={pwd} placeholder={t.pwdPh} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==='Enter'&&tryLogin()} autoFocus/></div>
        <Btn v="green" full onClick={tryLogin}>🔐 {t.loginBtn}</Btn>
        <button onClick={resetPassword} style={{display:'block',width:'100%',marginTop:12,background:'none',border:'none',color:'#d1d5db',fontSize:11,cursor:'pointer',textDecoration:'underline',fontFamily:'inherit'}}>
          {t.resetPwd}
        </button>
      </div>
    </div>
  );
}

/* ══════════  STUDENT PICKER  ══════════ */
function StudentPicker({onPick,onBack,t}){
  const[students,setStudents]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{db.get('s_students',[],true).then(s=>{setStudents(s);setLoading(false);});},[]);
  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#064e3b,#16a34a)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',borderRadius:20,padding:'30px 24px',width:'100%',maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,.28)'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'#9ca3af',fontSize:13,cursor:'pointer',marginBottom:14,display:'flex',alignItems:'center',gap:5,fontFamily:'inherit',fontWeight:700}}>← {t.back}</button>
        <div style={{textAlign:'center',marginBottom:22}}><div style={{fontSize:44,marginBottom:6}}>🧒</div><div className="fredoka" style={{fontSize:21,color:'#065f46'}}>{t.pickName}</div></div>
        {loading?<div style={{textAlign:'center',padding:30,color:'#9ca3af'}}>⏳ {t.loading}</div>
          :students.length===0?<div style={{textAlign:'center',padding:'20px 10px',color:'#6b7280',fontSize:13,lineHeight:1.8}}>{t.noStudentsYet}</div>
          :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:10}}>
            {students.map(s=>(
              <div key={s.id} onClick={()=>onPick(s.id)}
                style={{background:'#f0fdf4',border:'2px solid #d1fae5',borderRadius:14,padding:'16px 10px',textAlign:'center',cursor:'pointer',transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#064e3b';e.currentTarget.style.borderColor='#064e3b';e.currentTarget.querySelector('span').style.color='#fff';}}
                onMouseLeave={e=>{e.currentTarget.style.background='#f0fdf4';e.currentTarget.style.borderColor='#d1fae5';e.currentTarget.querySelector('span').style.color='';}}>
                <Avatar name={s.name} size={44}/>
                <span style={{display:'block',fontWeight:700,fontSize:13,marginTop:8,transition:'color .15s'}}>{s.name}</span>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}

/* ══════════  STUDENT APP  ══════════ */
function StudentApp({student,allWorks,setWorks,classes,onLogout,t}){
  const[tab,setTab]=useState('game');
  const myWorks=allWorks.filter(w=>w.studentId===student.id);
  return(
    <div style={{minHeight:'100vh',background:'#f0fdf4'}}>
      <div style={{background:'#064e3b',color:'#fff',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:50}}>
        <div><div className="fredoka" style={{fontSize:14,color:'#6ee7b7'}}>🌿 {t.app}</div><div style={{fontSize:13,color:'rgba(255,255,255,.75)',marginTop:1}}>{t.hi}，<b>{student.name}</b> 👋</div></div>
        <button onClick={onLogout} style={{background:'rgba(255,255,255,.1)',border:'none',color:'rgba(255,255,255,.75)',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{t.logout}</button>
      </div>
      <div style={{background:'#fff',borderBottom:'2px solid #e5e7eb',display:'flex',position:'sticky',top:52,zIndex:40}}>
        {[{id:'game',ic:'🎮',l:t.n.games},{id:'works',ic:'🎨',l:t.myWorks},{id:'reflection',ic:'📝',l:t.reflection}].map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,padding:'12px 8px',border:'none',borderBottom:`3px solid ${tab===tb.id?'#16a34a':'transparent'}`,background:'none',fontSize:13.5,fontWeight:700,cursor:'pointer',color:tab===tb.id?'#064e3b':'#9ca3af',display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontFamily:'inherit',transition:'all .15s'}}>
            {tb.ic} {tb.l}
          </button>
        ))}
      </div>
      <div style={{padding:'20px',maxWidth:720,margin:'0 auto'}} className="fi">
        {tab==='game'&&<StuGamePanel student={student} t={t}/>}
        {tab==='works'&&<StuWorksPanel student={student} myWorks={myWorks} allWorks={allWorks} setWorks={setWorks} classes={classes} t={t}/>}
        {tab==='reflection'&&<ReflectionPanel student={student} t={t} classes={classes}/>}
      </div>
    </div>
  );
}

/* ── Student: Game Panel ─────────────────────── */
function StuGamePanel({student,t}){
  const[game,setGame]=useState(null);
  const[myResp,setMyResp]=useState(null);
  const[apps,setApps]=useState([]);
  const gameIdRef=useRef(null);
  const questionIdxRef=useRef(null); // ✅ track question changes

  useEffect(()=>{
    db.get('s_webapps',[],true).then(setApps);
    const poll=async()=>{
      const g=await db.get('s_game',null,true);
      setGame(g);
      if(g?.id){
        const isNewGame=g.id!==gameIdRef.current;
        // ✅ FIX: detect question change even within same game
        const isNewQuestion=g.questionIdx!==questionIdxRef.current;
        if(isNewGame){
          gameIdRef.current=g.id;
          questionIdxRef.current=g.questionIdx;
          setMyResp(null);
        } else if(isNewQuestion){
          // Question changed → force clear response immediately
          questionIdxRef.current=g.questionIdx;
          setMyResp(null);
        } else {
          const r=await db.get(`s_resp_${student.id}`,null,true);
          setMyResp(r?.gameId===g.id?r:null);
        }
      } else {
        gameIdRef.current=null;questionIdxRef.current=null;setMyResp(null);
      }
    };
    poll();
    const iv=setInterval(poll,1200);
    return()=>clearInterval(iv);
  },[student.id]);

  const respond=async(data)=>{
    const resp={gameId:game.id,questionIdx:game.questionIdx,studentId:student.id,studentName:student.name,data,time:Date.now()};
    await db.set(`s_resp_${student.id}`,resp,true);
    setMyResp(resp);
  };

  return(
    <div>
      <div className="fredoka" style={{fontSize:18,color:'#064e3b',marginBottom:12}}>🌐 {t.waTitle}</div>
      {apps.length===0
        ?<div style={{...C.card,textAlign:'center',padding:'30px',color:'#9ca3af',fontSize:13}}>{t.noApps}</div>
        :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
          {apps.map(app=>(
            <div key={app.id} style={{...C.card,padding:'18px',display:'flex',flexDirection:'column',gap:8,transition:'transform .15s,box-shadow .15s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.12)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 14px rgba(0,0,0,.07)';}}>
              <div style={{fontSize:36,textAlign:'center'}}>{app.icon||'🎮'}</div>
              <div style={{fontWeight:800,fontSize:15,textAlign:'center',color:'#064e3b'}}>{app.name}</div>
              {app.desc&&<div style={{fontSize:12,color:'#6b7280',textAlign:'center',lineHeight:1.5}}>{app.desc}</div>}
              <a href={app.url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'9px',background:'#064e3b',color:'#fff',borderRadius:8,fontWeight:700,fontSize:13,textDecoration:'none',gap:5}}>{t.openApp}</a>
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ── Quiz Player (Student) ───────────────────── */
// ✅ FIX: localAnswered state resets per question, no stale myResp issue
function QuizPlayer({game,myResp,onAnswer,t}){
  const[sel,setSel]=useState(null);
  const[localAnswered,setLocalAnswered]=useState(false);
  const qKey=`${game.id}-${game.questionIdx}`;
  const prevQKey=useRef(null);

  // ✅ Reset local state when question changes
  useEffect(()=>{
    if(prevQKey.current!==qKey){
      prevQKey.current=qKey;
      setSel(null);
      setLocalAnswered(false);
    }
  },[qKey]);

  // Sync with server response (only if same question)
  useEffect(()=>{
    if(myResp?.gameId===game.id&&myResp?.questionIdx===game.questionIdx&&myResp?.data?.ansIdx!==undefined){
      setSel(myResp.data.ansIdx);
      setLocalAnswered(true);
    }
  },[myResp,qKey]);

  const answer=(i)=>{
    if(localAnswered||game.showAnswer)return;
    setSel(i);setLocalAnswered(true);
    onAnswer(i);
  };

  const showAnswer=game.showAnswer;
  const correct=game.correctIdx;

  return(
    <div style={C.card}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
        <Badge c="gold">📝 Q{(game.questionIdx||0)+1}</Badge>
        {showAnswer&&(localAnswered?(sel===correct?<Badge c="green">✅ 正确！</Badge>:<Badge c="red">❌ 答错了</Badge>):<Badge c="gray">{t.notAnswered}</Badge>)}
      </div>
      <div style={{fontWeight:800,fontSize:18,color:'#064e3b',marginBottom:20,lineHeight:1.4}}>{game.question}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {game.options.map((o,i)=>{
          let bg='#fff',border='#e5e7eb',color='#374151';
          if(showAnswer){if(i===correct){bg='#f0fdf4';border='#16a34a';color='#166534';}else if(i===sel&&i!==correct){bg='#fef2f2';border='#dc2626';color='#991b1b';}}
          else if(sel===i){bg='#f0fdf4';border='#16a34a';}
          return(
            <button key={i} onClick={()=>answer(i)}
              style={{padding:'13px 14px',border:`2px solid ${border}`,borderRadius:9,background:bg,color,cursor:(localAnswered||showAnswer)?'default':'pointer',fontWeight:700,fontSize:14,transition:'all .15s',fontFamily:'inherit',textAlign:'left'}}>
              <span style={{marginRight:7,opacity:.5}}>{String.fromCharCode(65+i)}.</span>{o}
            </button>
          );
        })}
      </div>
      {localAnswered&&!showAnswer&&<div style={{textAlign:'center',marginTop:14,background:'#f0fdf4',padding:'10px',borderRadius:8,color:'#16a34a',fontWeight:700,fontSize:13}}>✅ {t.waitReveal}</div>}
      {!localAnswered&&!showAnswer&&<div style={{textAlign:'center',marginTop:14,color:'#9ca3af',fontSize:13}}>{t.pleaseAnswer}</div>}
    </div>
  );
}

/* ── Student: Works Panel ────────────────────── */
function StuWorksPanel({student,myWorks,allWorks,setWorks,classes,t}){
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',desc:'',classId:'',imgData:'',workUrl:''});
  const[ok,setOk]=useState(false);
  const[lightbox,setLightbox]=useState(null); // ✅ lightbox state
  const f=v=>setForm(p=>({...p,...v}));
  const fileRef=useRef();
  const handleFile=async e=>{const file=e.target.files[0];if(file)f({imgData:await compressImg(file)});};

  // ✅ 粘贴图片功能 (Ctrl+V)
  useEffect(()=>{
    if(!showForm)return;
    const onPaste=async e=>{
      for(const item of(e.clipboardData?.items||[])){
        if(item.type.startsWith('image/')){
          const file=item.getAsFile();
          if(file)f({imgData:await compressImg(file)});
          break;
        }
      }
    };
    document.addEventListener('paste',onPaste);
    return()=>document.removeEventListener('paste',onPaste);
  },[showForm]);

  const save=async()=>{
    if(!form.title.trim())return;
    const newWork={...form,id:uid(),studentId:student.id,date:today(),uploadedByStudent:true};
    // ✅ FIX: use allWorks (full list) not myWorks (filtered)
    const updated=[...allWorks,newWork];
    setWorks(updated);
    await db.set('p_wrk',updated);
    setForm({title:'',desc:'',classId:'',imgData:'',workUrl:''});
    setShowForm(false);setOk(true);setTimeout(()=>setOk(false),3000);
  };

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div className="fredoka" style={{fontSize:22,color:'#064e3b'}}>🎨 {t.myWorks}</div>
        <Btn v="green" onClick={()=>setShowForm(v=>!v)}>+ {t.stuUploadW}</Btn>
      </div>
      {ok&&<div style={{background:'#f0fdf4',color:'#166534',padding:'10px 14px',borderRadius:8,fontWeight:700,fontSize:13,marginBottom:14}}>{t.uploadOk}</div>}
      {showForm&&(
        <div style={{...C.card,marginBottom:18,border:'2px solid #d1fae5'}}>
          <div className="fredoka" style={{fontSize:16,color:'#064e3b',marginBottom:14}}>✏️ {t.stuUploadW}</div>
          <div style={C.fg}><label style={C.lbl}>{t.stuWTitle} *</label><input style={C.inp} value={form.title} onChange={e=>f({title:e.target.value})} autoFocus/></div>
          <div style={C.fg}><label style={C.lbl}>{t.stuWDesc}</label><textarea style={{...C.inp,resize:'vertical',minHeight:70}} value={form.desc} onChange={e=>f({desc:e.target.value})}/></div>
          {classes.length>0&&<div style={C.fg}><label style={C.lbl}>{t.wCls}</label><select style={{...C.inp,...SEL}} value={form.classId} onChange={e=>f({classId:e.target.value})}><option value="">--</option>{[...classes].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(c=><option key={c.id} value={c.id}>{c.date} — {c.topic}</option>)}</select></div>}
          <div style={C.fg}>
            <label style={C.lbl}>{t.wImg}</label>
            <input type="file" accept="image/*" ref={fileRef} style={{display:'none'}} onChange={handleFile}/>
            <div style={{display:'flex',gap:8}}>
              <Btn v="ghost" onClick={()=>fileRef.current.click()} style={{flex:1,justifyContent:'center'}}>📷 {t.wImg}</Btn>
              <Btn v="ghost" onClick={()=>document.execCommand('paste')} style={{flex:1,justifyContent:'center'}}>📋 Ctrl+V 粘贴</Btn>
            </div>
            <div style={{fontSize:11,color:'#9ca3af',marginTop:5,textAlign:'center'}}>截图后可直接按 Ctrl+V 粘贴</div>
            {form.imgData&&<img src={form.imgData} alt="preview" style={{width:'100%',marginTop:8,borderRadius:8,aspectRatio:'16/9',objectFit:'cover'}}/>}
          </div>
          <div style={C.fg}><label style={C.lbl}>🔗 {t.wLink}</label><input style={C.inp} value={form.workUrl} placeholder="https://..." onChange={e=>f({workUrl:e.target.value})}/></div>
          <div style={{display:'flex',gap:8}}><Btn v="outline" onClick={()=>setShowForm(false)}>{t.cancel}</Btn><Btn v="green" disabled={!form.title.trim()} onClick={save}>✅ {t.save}</Btn></div>
        </div>
      )}
      {myWorks.length===0?<Empty icon="🎨" text={t.noMyWorks}/>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14}}>
          {[...myWorks].reverse().map(w=>{
            const cls=classes.find(c=>c.id===w.classId);
            return(
              <div key={w.id} style={{...C.card,padding:0,overflow:'hidden'}}>
                {w.imgData
                  ?<img src={w.imgData} alt={w.title}
                      onClick={()=>setLightbox({src:w.imgData,alt:w.title})}
                      style={{width:'100%',aspectRatio:'16/9',objectFit:'cover',cursor:'zoom-in',display:'block'}}/>
                  :(w.workUrl||w.videoUrl)?<div style={{aspectRatio:'16/9',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center'}}><a href={w.workUrl||w.videoUrl} target="_blank" rel="noreferrer" style={{color:'#16a34a',fontWeight:700}}>🔗 打开作品链接</a></div>
                  :<div style={{aspectRatio:'16/9',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36}}>🎨</div>}
                <div style={{padding:12}}>
                  <div style={{fontWeight:800,fontSize:14}}>{w.title}</div>
                  {w.desc&&<div style={{fontSize:12,color:'#6b7280',marginTop:3}}>{w.desc}</div>}
                  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:7}}>
                    {cls&&<Badge c="gold">📚 {cls.topic}</Badge>}
                    <Badge c="gray">{w.date}</Badge>
                    {w.uploadedByStudent&&<Badge c="purple">⭐ 自己上传</Badge>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {lightbox&&<Lightbox src={lightbox.src} alt={lightbox.alt} onClose={()=>setLightbox(null)}/>}
    </div>
  );
}

/* ── Reflection Panel ────────────────────────── */
function ReflectionPanel({student,t,classes}){
  const[text,setText]=useState('');const[selClass,setSelClass]=useState('');const[submitted,setSubmitted]=useState(false);const[history,setHistory]=useState([]);
  useEffect(()=>{db.get(`s_refl_${student.id}`,[],true).then(setHistory);},[student.id]);
  const submit=async()=>{
    if(!text.trim())return;
    const entry={id:uid(),text,classId:selClass,date:today(),studentId:student.id,studentName:student.name};
    const updated=[...history,entry];
    await db.set(`s_refl_${student.id}`,updated,true);
    setHistory(updated);setText('');setSubmitted(true);setTimeout(()=>setSubmitted(false),3000);
  };
  return(
    <div>
      <div style={C.card}>
        <div className="fredoka" style={{fontSize:18,color:'#064e3b',marginBottom:14}}>📝 {t.reflection}</div>
        {submitted&&<div style={{background:'#f0fdf4',color:'#166534',padding:'9px 13px',borderRadius:8,fontWeight:700,fontSize:13,marginBottom:12}}>{t.submitted}</div>}
        {classes.length>0&&<div style={C.fg}><label style={C.lbl}>{t.wCls}</label><select style={{...C.inp,...SEL}} value={selClass} onChange={e=>setSelClass(e.target.value)}><option value="">-- 选择课堂（选填）--</option>{[...classes].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(c=><option key={c.id} value={c.id}>{c.date} — {c.topic}</option>)}</select></div>}
        {/* ✅ Hint prompts */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:'#9ca3af',marginBottom:6}}>💬 写作提示（点击填入）</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {t.reflHints.map((h,i)=>(
              <button key={i} onClick={()=>setText(prev=>prev?(prev+'\n'+h):h)}
                style={{padding:'5px 12px',background:'#f0fdf4',border:'1.5px solid #d1fae5',borderRadius:20,fontSize:12,fontWeight:600,color:'#065f46',cursor:'pointer',fontFamily:'inherit',transition:'all .15s',textAlign:'left'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#064e3b';e.currentTarget.style.color='#fff';}}
                onMouseLeave={e=>{e.currentTarget.style.background='#f0fdf4';e.currentTarget.style.color='#065f46';}}>
                {h}
              </button>
            ))}
          </div>
        </div>
        <div style={C.fg}><textarea style={{...C.inp,resize:'vertical',minHeight:110}} value={text} placeholder={t.reflPh} onChange={e=>setText(e.target.value)}/></div>
        <Btn v="green" onClick={submit} disabled={!text.trim()}>✈️ {t.submit}</Btn>
      </div>
      {history.length>0&&(
        <div style={{marginTop:16}}>
          <div className="fredoka" style={{fontSize:15,color:'#064e3b',marginBottom:10}}>📖 {t.allRefl}</div>
          {[...history].reverse().map(h=>{const cls=classes.find(c=>c.id===h.classId);return(
            <div key={h.id} style={{...C.card,marginBottom:10,padding:'14px 16px'}}>
              {cls&&<div style={{marginBottom:6}}><Badge c="gold">📚 {cls.topic}</Badge></div>}
              <div style={{fontSize:14,lineHeight:1.6}}>{h.text}</div>
              <div style={{fontSize:11,color:'#9ca3af',marginTop:6}}>{h.date}</div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

/* ══════════  TEACHER APP  ══════════ */
function TeacherApp({students,setStudents,classes,setClasses,works,setWorks,lang,setLang,t,onLogout}){
  const[page,setPage]=useState('dashboard');
  const props={students,setStudents,classes,setClasses,works,setWorks,t,setPage};
  const nav=[{id:'dashboard',ic:'🏠',l:t.n.home},{id:'students',ic:'👨‍🎓',l:t.n.students},{id:'classes',ic:'📚',l:t.n.classes},{id:'works',ic:'🎨',l:t.n.works},{id:'games',ic:'🎮',l:t.n.games},{id:'settings',ic:'⚙️',l:t.n.settings}];
  return(
    <div style={{display:'flex',minHeight:'100vh',background:'#f0fdf4'}}>
      <aside className="sidebar" style={{width:210,background:'#064e3b',color:'#fff',position:'fixed',top:0,left:0,height:'100vh',display:'flex',flexDirection:'column',zIndex:100}}>
        <div style={{padding:'18px 15px',borderBottom:'1px solid rgba(255,255,255,.1)'}}><div className="fredoka" style={{fontSize:13.5,color:'#6ee7b7',lineHeight:1.4}}>🌿 {t.app}</div><div style={{fontSize:10.5,color:'rgba(255,255,255,.4)',marginTop:2}}>👩‍🏫 {t.teacher}</div></div>
        <nav style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
          {nav.map(({id,ic,l})=><div key={id} onClick={()=>setPage(id)} style={{padding:'11px 15px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:13,fontWeight:700,borderLeft:`3px solid ${page===id?'#34d399':'transparent'}`,background:page===id?'rgba(52,211,153,.12)':'none',color:page===id?'#34d399':'rgba(255,255,255,.62)',transition:'all .12s'}}><span style={{fontSize:16}}>{ic}</span>{l}</div>)}
        </nav>
        <div style={{padding:'12px 15px',borderTop:'1px solid rgba(255,255,255,.1)'}}>
          <div style={{display:'flex',background:'rgba(255,255,255,.1)',borderRadius:20,padding:3,marginBottom:10}}>
            {['zh','en'].map(l=><button key={l} onClick={()=>setLang(l)} style={{flex:1,padding:'4px',border:'none',borderRadius:17,fontSize:11,fontWeight:700,cursor:'pointer',background:lang===l?'#f59e0b':'none',color:lang===l?'#064e3b':'rgba(255,255,255,.55)',transition:'all .2s',fontFamily:'inherit'}}>{l==='zh'?'中文':'EN'}</button>)}
          </div>
          <button onClick={onLogout} style={{width:'100%',padding:'8px',background:'rgba(239,68,68,.15)',color:'#fca5a5',border:'none',borderRadius:8,fontSize:12.5,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>🚪 {t.logout}</button>
        </div>
      </aside>
      <main className="main-wrap" style={{flex:1,marginLeft:210,padding:'22px 22px 40px',overflowX:'hidden',minHeight:'100vh'}}>
        {/* ✅ Mobile back button */}
        {page!=='dashboard'&&<div style={{display:'none'}} id="mob-back">
          <button onClick={()=>setPage('dashboard')} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#16a34a',fontWeight:700,fontSize:14,cursor:'pointer',marginBottom:14,fontFamily:'inherit',padding:0}}>
            ← {t.n.home}
          </button>
        </div>}
        <div key={page} className="fi">
          {page==='dashboard'&&<Dashboard {...props}/>}
          {page==='students'&&<Students {...props}/>}
          {page==='classes'&&<Classes {...props}/>}
          {page==='works'&&<Works {...props}/>}
          {page==='games'&&<GameMaster students={students} t={t}/>}
          {page==='settings'&&<Settings t={t} lang={lang} setLang={setLang} students={students}/>}
        </div>
      </main>
      <nav className="bnav" style={{display:'none',position:'fixed',bottom:0,left:0,right:0,background:'#064e3b',zIndex:100}}>
        {nav.map(({id,ic,l})=><div key={id} onClick={()=>setPage(id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:1,padding:'5px 2px',cursor:'pointer',color:page===id?'#34d399':'rgba(255,255,255,.52)',fontSize:9,fontWeight:700}}><span style={{fontSize:18}}>{ic}</span>{l}</div>)}
      </nav>
    </div>
  );
}

/* ── Dashboard ───────────────────────────────── */
function Dashboard({students,classes,works,t,setPage}){
  const recent=[...classes].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3);
  return(
    <div>
      <PH title={`🌿 ${t.app}`} sub={t.tag}/>
      <div className="g3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[{ic:'👨‍🎓',n:students.length,l:t.totalS,bg:'#f0fdf4',c:'#166534'},{ic:'📚',n:classes.length,l:t.totalC,bg:'#fffbeb',c:'#92400e'},{ic:'🎨',n:works.length,l:t.totalW,bg:'#eff6ff',c:'#1e40af'}].map((s,i)=>(
          <div key={i} style={{...C.card,display:'flex',alignItems:'center',gap:12,padding:16}}>
            <div style={{width:46,height:46,borderRadius:12,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.ic}</div>
            <div><div className="fredoka" style={{fontSize:26,color:s.c,lineHeight:1}}>{s.n}</div><div style={{fontSize:11.5,color:'#6b7280'}}>{s.l}</div></div>
          </div>
        ))}
      </div>
      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={C.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><span className="fredoka" style={{fontSize:15,color:'#064e3b'}}>{t.recent}</span><Btn v="ghost" size="sm" onClick={()=>setPage('classes')}>→</Btn></div>
          {recent.length===0?<Empty icon="📅" text={t.noRecent}/>:recent.map(c=>(
            <div key={c.id} style={{padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontWeight:700,fontSize:14}}>{c.topic}</div><div style={{fontSize:11,color:'#9ca3af'}}>{c.date}</div></div>
                <Badge c="green">{c.attendance?.filter(a=>a.p).length||0}/{students.length}</Badge>
              </div>
            </div>
          ))}
        </div>
        <div style={C.card}>
          <div className="fredoka" style={{fontSize:15,color:'#064e3b',marginBottom:14}}>{t.quick}</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[{l:t.addS,ic:'👨‍🎓',p:'students'},{l:t.addC,ic:'📚',p:'classes'},{l:t.addW,ic:'🎨',p:'works'},{l:'🎮 '+t.n.games,p:'games'}].map(q=>(
              <Btn key={q.p} v="outline" onClick={()=>setPage(q.p)} style={{justifyContent:'flex-start',width:'100%'}}>{q.ic||''} {q.l}</Btn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Students ────────────────────────────────── */
function Students({students,setStudents,t}){
  const[modal,setModal]=useState(null);const[del,setDel]=useState(null);const[search,setSearch]=useState('');
  const[detail,setDetail]=useState(null); // ✅ detail view
  const blank={name:'',grade:'',hobby:'',favItem:'',notes:''};const[form,setForm]=useState(blank);
  const f=v=>setForm(p=>({...p,...v}));
  const save=()=>{if(!form.name.trim())return;if(modal==='add')setStudents(p=>[...p,{...form,id:uid()}]);else setStudents(p=>p.map(s=>s.id===modal.id?{...s,...form}:s));setModal(null);};
  const filtered=students.filter(s=>[s.name,s.grade,s.hobby].join(' ').toLowerCase().includes(search.toLowerCase()));
  return(
    <div>
      <PH title={`👨‍🎓 ${t.sList}`} sub={`${students.length} ${t.totalS}`} action={<Btn v="green" onClick={()=>{setForm(blank);setModal('add');}}>+ {t.addS}</Btn>}/>
      <div style={{...C.card,marginBottom:14,padding:'10px 14px'}}><input style={C.inp} placeholder={`🔍 ${t.search}...`} value={search} onChange={e=>setSearch(e.target.value)}/></div>
      {filtered.length===0?<Empty icon="👨‍🎓" text={t.noStudents}/>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
          {filtered.map(s=>(
            <div key={s.id} style={{...C.card,padding:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                {/* ✅ Click avatar/name to view details */}
                <div onClick={()=>setDetail(s)} style={{cursor:'pointer',display:'flex',alignItems:'center',gap:12,flex:1,minWidth:0}}>
                  <Avatar name={s.name}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,fontSize:15,color:'#064e3b',textDecoration:'underline',textDecorationColor:'#d1fae5'}}>{s.name}</div>
                    {s.grade&&<div style={{fontSize:11.5,color:'#6b7280'}}>{s.grade}</div>}
                  </div>
                </div>
                <div style={{display:'flex',gap:5}}><Btn v="ghost" size="sm" onClick={()=>{setForm({name:s.name,grade:s.grade||'',hobby:s.hobby||'',favItem:s.favItem||'',notes:s.notes||''});setModal(s);}}>✏️</Btn><Btn v="red" size="sm" onClick={()=>setDel(s)}>🗑️</Btn></div>
              </div>
              {(s.hobby||s.favItem)&&<div style={{display:'flex',flexWrap:'wrap',gap:5,paddingTop:8,borderTop:'1px solid #f3f4f6'}}>{s.hobby&&<Badge c="green">❤️ {s.hobby}</Badge>}{s.favItem&&<Badge c="gold">⭐ {s.favItem}</Badge>}</div>}
              {s.notes&&<div style={{fontSize:12,color:'#9ca3af',marginTop:6}}>{s.notes}</div>}
            </div>
          ))}
        </div>
      )}
      {modal&&<Modal title={modal==='add'?t.addS:t.editS} onClose={()=>setModal(null)} footer={<><Btn v="outline" onClick={()=>setModal(null)}>{t.cancel}</Btn><Btn v="green" onClick={save}>{t.save}</Btn></>}>
        <div style={C.fg}><label style={C.lbl}>{t.name} *</label><input style={C.inp} value={form.name} onChange={e=>f({name:e.target.value})} autoFocus/></div>
        <div style={C.fg}><label style={C.lbl}>{t.grade}</label><input style={C.inp} value={form.grade} placeholder="e.g. 小学3年级" onChange={e=>f({grade:e.target.value})}/></div>
        <div style={C.fg}><label style={C.lbl}>❤️ {t.hobby}</label><input style={C.inp} value={form.hobby} placeholder="e.g. 画画、打篮球" onChange={e=>f({hobby:e.target.value})}/></div>
        <div style={C.fg}><label style={C.lbl}>⭐ {t.favItem}</label><input style={C.inp} value={form.favItem} placeholder="e.g. 乐高、恐龙玩具" onChange={e=>f({favItem:e.target.value})}/></div>
        <div style={C.fg}><label style={C.lbl}>{t.notes}</label><textarea style={{...C.inp,resize:'vertical',minHeight:70}} value={form.notes} onChange={e=>f({notes:e.target.value})}/></div>
      </Modal>}
      {/* ✅ Student detail view modal */}
      {detail&&<Modal title={detail.name} onClose={()=>setDetail(null)} footer={<><Btn v="outline" onClick={()=>setDetail(null)}>{t.close}</Btn><Btn v="ghost" onClick={()=>{setForm({name:detail.name,grade:detail.grade||'',hobby:detail.hobby||'',favItem:detail.favItem||'',notes:detail.notes||''});setModal(detail);setDetail(null);}}>✏️ {t.edit}</Btn></>}>
        <div style={{textAlign:'center',marginBottom:20}}>
          <Avatar name={detail.name} size={64}/>
          <div className="fredoka" style={{fontSize:22,color:'#064e3b',marginTop:10}}>{detail.name}</div>
          {detail.grade&&<div style={{fontSize:13,color:'#6b7280',marginTop:3}}>{detail.grade}</div>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {detail.hobby&&<div style={{background:'#f0fdf4',borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:20}}>❤️</span><div><div style={{fontSize:11,fontWeight:700,color:'#6b7280',marginBottom:2}}>{t.hobby}</div><div style={{fontSize:14,fontWeight:700}}>{detail.hobby}</div></div></div>}
          {detail.favItem&&<div style={{background:'#fffbeb',borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:20}}>⭐</span><div><div style={{fontSize:11,fontWeight:700,color:'#6b7280',marginBottom:2}}>{t.favItem}</div><div style={{fontSize:14,fontWeight:700}}>{detail.favItem}</div></div></div>}
          {detail.notes&&<div style={{background:'#f9fafb',borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:20}}>📝</span><div><div style={{fontSize:11,fontWeight:700,color:'#6b7280',marginBottom:2}}>{t.notes}</div><div style={{fontSize:14}}>{detail.notes}</div></div></div>}
          {!detail.hobby&&!detail.favItem&&!detail.notes&&<div style={{textAlign:'center',color:'#9ca3af',fontSize:13,padding:'10px 0'}}>暂无详细资料，点击编辑添加</div>}
        </div>
      </Modal>}
      {del&&<Modal title="⚠️" onClose={()=>setDel(null)} footer={<><Btn v="outline" onClick={()=>setDel(null)}>{t.cancel}</Btn><Btn v="red" onClick={()=>{setStudents(p=>p.filter(s=>s.id!==del.id));setDel(null);}}>🗑️ {t.del}</Btn></>}><p style={{fontSize:14}}>{t.confirmDel}</p><p style={{fontWeight:700,marginTop:8}}>{del.name}</p></Modal>}
    </div>
  );
}

/* ── Classes ─────────────────────────────────── */
function Classes({classes,setClasses,students,t}){
  const[modal,setModal]=useState(null);const[detail,setDetail]=useState(null);const[del,setDel]=useState(null);
  const blank=()=>({date:today(),topic:'',content:'',perf:'',notes:'',attendance:students.map(s=>({id:s.id,name:s.name,p:true}))});
  const[form,setForm]=useState(blank());const f=v=>setForm(p=>({...p,...v}));
  const toggleAtt=id=>setForm(p=>({...p,attendance:p.attendance.map(a=>a.id===id?{...a,p:!a.p}:a)}));
  const openEdit=c=>{const att=students.map(s=>c.attendance?.find(a=>a.id===s.id)||{id:s.id,name:s.name,p:true});setForm({...c,attendance:att});setModal(c);};
  const save=()=>{if(!form.topic.trim())return;if(modal==='add')setClasses(p=>[...p,{...form,id:uid()}]);else setClasses(p=>p.map(c=>c.id===modal.id?{...c,...form}:c));setModal(null);};
  const sorted=[...classes].sort((a,b)=>new Date(b.date)-new Date(a.date));
  return(
    <div>
      <PH title={`📚 ${t.cList}`} sub={`${classes.length} ${t.totalC}`} action={<Btn v="green" onClick={()=>{setForm(blank());setModal('add');}}>+ {t.addC}</Btn>}/>
      {sorted.length===0?<Empty icon="📚" text={t.noClasses}/>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
          {sorted.map(c=>(
            <div key={c.id} style={{...C.card,cursor:'pointer',transition:'transform .15s'}} onClick={()=>setDetail(c)} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><Badge c="gold">{c.date}</Badge><Badge c="green">{c.attendance?.filter(a=>a.p).length||0}/{students.length}</Badge></div>
              <div style={{fontWeight:800,fontSize:15,color:'#064e3b',marginBottom:4}}>{c.topic}</div>
              {c.content&&<div style={{fontSize:12.5,color:'#6b7280',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{c.content}</div>}
              <div style={{display:'flex',gap:6,marginTop:12}} onClick={e=>e.stopPropagation()}><Btn v="ghost" size="sm" onClick={()=>openEdit(c)}>✏️ {t.edit}</Btn><Btn v="red" size="sm" onClick={()=>setDel(c)}>🗑️</Btn></div>
            </div>
          ))}
        </div>
      )}
      {modal&&<Modal title={modal==='add'?t.addC:t.editC} onClose={()=>setModal(null)} footer={<><Btn v="outline" onClick={()=>setModal(null)}>{t.cancel}</Btn><Btn v="green" onClick={save}>{t.save}</Btn></>}>
        <div style={C.fg}><label style={C.lbl}>{t.date}</label><input type="date" style={C.inp} value={form.date} onChange={e=>f({date:e.target.value})}/></div>
        <div style={C.fg}><label style={C.lbl}>{t.topic} *</label><input style={C.inp} value={form.topic} onChange={e=>f({topic:e.target.value})}/></div>
        <div style={C.fg}><label style={C.lbl}>{t.content}</label><textarea style={{...C.inp,resize:'vertical',minHeight:75}} value={form.content} onChange={e=>f({content:e.target.value})}/></div>
        <div style={C.fg}><label style={C.lbl}>{t.perf}</label><textarea style={{...C.inp,resize:'vertical',minHeight:75}} value={form.perf} onChange={e=>f({perf:e.target.value})}/></div>
        <div style={C.fg}><label style={C.lbl}>{t.att}</label><div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>{form.attendance.map(a=><div key={a.id} onClick={()=>toggleAtt(a.id)} style={{padding:'6px 14px',border:`2px solid ${a.p?'#16a34a':'#dc2626'}`,borderRadius:20,cursor:'pointer',fontSize:13,fontWeight:700,background:a.p?'#f0fdf4':'#fef2f2',color:a.p?'#166534':'#991b1b',transition:'all .15s'}}>{a.p?'✅':'❌'} {a.name}</div>)}</div></div>
        <div style={C.fg}><label style={C.lbl}>{t.notes}</label><textarea style={{...C.inp,resize:'vertical',minHeight:60}} value={form.notes} onChange={e=>f({notes:e.target.value})}/></div>
      </Modal>}
      {detail&&<Modal title={detail.topic} onClose={()=>setDetail(null)} footer={<><Btn v="outline" onClick={()=>setDetail(null)}>{t.close}</Btn><Btn v="ghost" onClick={()=>{openEdit(detail);setDetail(null);}}>✏️ {t.edit}</Btn></>}>
        <Badge c="gold">{detail.date}</Badge>
        {detail.content&&<><div style={{...C.lbl,marginTop:14}}>{t.content}</div><p style={{fontSize:14,lineHeight:1.6}}>{detail.content}</p></>}
        {detail.perf&&<><div style={{...C.lbl,marginTop:10}}>{t.perf}</div><p style={{fontSize:14,lineHeight:1.6}}>{detail.perf}</p></>}
        {detail.attendance?.length>0&&<><div style={{...C.lbl,marginTop:10}}>{t.att}</div><div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>{detail.attendance.map(a=><Badge key={a.id} c={a.p?'green':'red'}>{a.p?'✅':'❌'} {a.name}</Badge>)}</div></>}
      </Modal>}
      {del&&<Modal title="⚠️" onClose={()=>setDel(null)} footer={<><Btn v="outline" onClick={()=>setDel(null)}>{t.cancel}</Btn><Btn v="red" onClick={()=>{setClasses(p=>p.filter(c=>c.id!==del.id));setDel(null);}}>🗑️ {t.del}</Btn></>}><p style={{fontSize:14}}>{t.confirmDel}</p><p style={{fontWeight:700,marginTop:8}}>{del.topic}</p></Modal>}
    </div>
  );
}

/* ── Works (Teacher) ─────────────────────────── */
function Works({works,setWorks,students,classes,t}){
  const[modal,setModal]=useState(false);const[filter,setFilter]=useState('all');const[del,setDel]=useState(null);
  const[lightbox,setLightbox]=useState(null); // ✅ lightbox
  const blank={title:'',desc:'',studentId:'',classId:'',imgData:'',workUrl:''};const[form,setForm]=useState(blank);
  const f=v=>setForm(p=>({...p,...v}));const fileRef=useRef();
  const handleFile=async e=>{const file=e.target.files[0];if(file)f({imgData:await compressImg(file)});};

  // ✅ 粘贴图片 (Ctrl+V)
  useEffect(()=>{
    if(!modal)return;
    const onPaste=async e=>{
      for(const item of(e.clipboardData?.items||[])){
        if(item.type.startsWith('image/')){
          const file=item.getAsFile();
          if(file)f({imgData:await compressImg(file)});
          break;
        }
      }
    };
    document.addEventListener('paste',onPaste);
    return()=>document.removeEventListener('paste',onPaste);
  },[modal]);
  const save=()=>{if(!form.title.trim()||!form.studentId)return;setWorks(p=>[...p,{...form,id:uid(),date:today()}]);setModal(false);setForm(blank);};
  const sorted=[...works].filter(w=>filter==='all'||w.studentId===filter).sort((a,b)=>new Date(b.date)-new Date(a.date));
  return(
    <div>
      <PH title={`🎨 ${t.wList}`} sub={`${works.length} ${t.totalW}`} action={<Btn v="green" onClick={()=>{setForm(blank);setModal(true);}}>+ {t.addW}</Btn>}/>
      {students.length>0&&<div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>{[{id:'all',l:t.all},...students.map(s=>({id:s.id,l:s.name}))].map(o=><Btn key={o.id} v={filter===o.id?'green':'ghost'} size="sm" onClick={()=>setFilter(o.id)}>{o.l}</Btn>)}</div>}
      {sorted.length===0?<Empty icon="🎨" text={t.noWorks}/>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
          {sorted.map(w=>{const stu=students.find(s=>s.id===w.studentId);const cls=classes.find(c=>c.id===w.classId);return(
            <div key={w.id} style={{...C.card,padding:0,overflow:'hidden'}}>
              {w.imgData?<img src={w.imgData} alt={w.title}
                  onClick={()=>setLightbox({src:w.imgData,alt:w.title})}
                  style={{width:'100%',aspectRatio:'16/9',objectFit:'cover',display:'block',cursor:'zoom-in'}}/>
                :(w.workUrl||w.videoUrl)?<div style={{aspectRatio:'16/9',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center'}}><a href={w.workUrl||w.videoUrl} target="_blank" rel="noreferrer" style={{color:'#16a34a',fontWeight:700,fontSize:14}}>🔗 打开作品链接</a></div>
                :<div style={{aspectRatio:'16/9',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36}}>🎨</div>}
              <div style={{padding:14}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>{w.title}</div>
                {w.desc&&<div style={{fontSize:12.5,color:'#6b7280',marginBottom:8}}>{w.desc}</div>}
                <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
                  {stu&&<Badge c="green">👤 {stu.name}</Badge>}
                  {cls&&<Badge c="gold">📚 {cls.topic}</Badge>}
                  {w.uploadedByStudent&&<Badge c="purple">⭐ 学生上传</Badge>}
                  <Badge c="gray">{w.date}</Badge>
                </div>
                <Btn v="red" size="sm" onClick={()=>setDel(w)}>🗑️ {t.del}</Btn>
              </div>
            </div>
          );})}
        </div>
      )}
      {modal&&<Modal title={t.addW} onClose={()=>setModal(false)} footer={<><Btn v="outline" onClick={()=>setModal(false)}>{t.cancel}</Btn><Btn v="green" onClick={save}>{t.save}</Btn></>}>
        <div style={C.fg}><label style={C.lbl}>{t.wTitle} *</label><input style={C.inp} value={form.title} onChange={e=>f({title:e.target.value})}/></div>
        <div style={C.fg}><label style={C.lbl}>{t.wStu} *</label><select style={{...C.inp,...SEL}} value={form.studentId} onChange={e=>f({studentId:e.target.value})}><option value="">--</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div style={C.fg}><label style={C.lbl}>{t.wCls}</label><select style={{...C.inp,...SEL}} value={form.classId} onChange={e=>f({classId:e.target.value})}><option value="">--</option>{[...classes].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(c=><option key={c.id} value={c.id}>{c.date} — {c.topic}</option>)}</select></div>
        <div style={C.fg}><label style={C.lbl}>{t.wDesc}</label><textarea style={{...C.inp,resize:'vertical',minHeight:70}} value={form.desc} onChange={e=>f({desc:e.target.value})}/></div>
        <div style={C.fg}>
          <label style={C.lbl}>{t.wImg}</label>
          <input type="file" accept="image/*" ref={fileRef} style={{display:'none'}} onChange={handleFile}/>
          <div style={{display:'flex',gap:8}}>
            <Btn v="ghost" onClick={()=>fileRef.current.click()} style={{flex:1,justifyContent:'center'}}>📷 {t.wImg}</Btn>
            <Btn v="ghost" style={{flex:1,justifyContent:'center'}}>📋 Ctrl+V 粘贴</Btn>
          </div>
          <div style={{fontSize:11,color:'#9ca3af',marginTop:5,textAlign:'center'}}>截图后可直接按 Ctrl+V 粘贴</div>
          {form.imgData&&<img src={form.imgData} alt="preview" style={{width:'100%',marginTop:8,borderRadius:8,aspectRatio:'16/9',objectFit:'cover'}}/>}
        </div>
        <div style={C.fg}><label style={C.lbl}>🔗 {t.wLink}</label><input style={C.inp} value={form.workUrl} placeholder="https://..." onChange={e=>f({workUrl:e.target.value})}/></div>
      </Modal>}
      {del&&<Modal title="⚠️" onClose={()=>setDel(null)} footer={<><Btn v="outline" onClick={()=>setDel(null)}>{t.cancel}</Btn><Btn v="red" onClick={()=>{setWorks(p=>p.filter(w=>w.id!==del.id));setDel(null);}}>🗑️ {t.del}</Btn></>}><p style={{fontSize:14}}>{t.confirmDel}</p><p style={{fontWeight:700,marginTop:8}}>{del.title}</p></Modal>}
      {lightbox&&<Lightbox src={lightbox.src} alt={lightbox.alt} onClose={()=>setLightbox(null)}/>}
    </div>
  );
}
function GameMaster({students,t}){
  return(
    <div>
      <PH title={`🎮 ${t.n.games}`}/>
      <WebAppsManager t={t}/>
    </div>
  );
}

/* ── Web Apps Manager ────────────────────────── */
function WebAppsManager({t}){
  const[apps,setApps]=useState([]);const[modal,setModal]=useState(null);const[del,setDel]=useState(null);
  const blank={name:'',url:'',desc:'',icon:'🎮'};const[form,setForm]=useState(blank);const f=v=>setForm(p=>({...p,...v}));
  const EMOJIS=['🎮','🤖','🎯','🧩','🎨','✏️','🔬','🚀','🌍','💡','🎲','🧠','🦾','🎵','🌈'];
  useEffect(()=>{db.get('s_webapps',[],true).then(setApps);},[]);
  const persist=async updated=>{setApps(updated);await db.set('s_webapps',updated,true);};
  const save=async()=>{
    if(!form.name.trim()||!form.url.trim())return;
    let url=form.url.trim();if(!/^https?:\/\//i.test(url))url='https://'+url;
    if(modal==='add')await persist([...apps,{...form,url,id:uid()}]);
    else await persist(apps.map(a=>a.id===modal.id?{...form,url}:a));
    setModal(null);
  };
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div><div className="fredoka" style={{fontSize:20,color:'#064e3b'}}>🌐 {t.waTitle}</div><div style={{fontSize:13,color:'#6b7280',marginTop:2}}>添加的链接会显示在学生的游戏页面</div></div>
        <Btn v="green" onClick={()=>{setForm(blank);setModal('add');}}>+ {t.addApp}</Btn>
      </div>
      {apps.length===0?<Empty icon="🌐" text={t.noApps}/>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14}}>
          {apps.map(app=>(
            <div key={app.id} style={{...C.card,padding:'18px'}}>
              <div style={{fontSize:40,textAlign:'center',marginBottom:8}}>{app.icon||'🎮'}</div>
              <div style={{fontWeight:800,fontSize:16,textAlign:'center',color:'#064e3b',marginBottom:4}}>{app.name}</div>
              {app.desc&&<div style={{fontSize:12.5,color:'#6b7280',textAlign:'center',marginBottom:10,lineHeight:1.5}}>{app.desc}</div>}
              <div style={{fontSize:11,color:'#9ca3af',textAlign:'center',marginBottom:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{app.url}</div>
              <div style={{display:'flex',gap:6}}>
                <a href={app.url} target="_blank" rel="noreferrer" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'8px',background:'#f0fdf4',color:'#16a34a',borderRadius:7,fontWeight:700,fontSize:12.5,textDecoration:'none',gap:4}}>🔗 测试</a>
                <Btn v="ghost" size="sm" onClick={()=>{setForm({name:app.name,url:app.url,desc:app.desc||'',icon:app.icon||'🎮'});setModal(app);}}>✏️</Btn>
                <Btn v="red" size="sm" onClick={()=>setDel(app)}>🗑️</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal&&<Modal title={modal==='add'?t.addApp:t.editApp} onClose={()=>setModal(null)} footer={<><Btn v="outline" onClick={()=>setModal(null)}>{t.cancel}</Btn><Btn v="green" onClick={save} disabled={!form.name.trim()||!form.url.trim()}>{t.save}</Btn></>}>
        <div style={C.fg}><label style={C.lbl}>{t.appIcon}</label><div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>{EMOJIS.map(em=><button key={em} onClick={()=>f({icon:em})} style={{width:36,height:36,fontSize:20,border:`2px solid ${form.icon===em?'#16a34a':'#e5e7eb'}`,borderRadius:8,background:form.icon===em?'#f0fdf4':'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{em}</button>)}</div></div>
        <div style={C.fg}><label style={C.lbl}>{t.appName} *</label><input style={C.inp} value={form.name} onChange={e=>f({name:e.target.value})} placeholder="e.g. Scratch, Tinkercad..."/></div>
        <div style={C.fg}><label style={C.lbl}>{t.appUrl} *</label><input style={C.inp} value={form.url} onChange={e=>f({url:e.target.value})} placeholder="https://scratch.mit.edu"/></div>
        <div style={C.fg}><label style={C.lbl}>{t.appDesc}</label><input style={C.inp} value={form.desc} onChange={e=>f({desc:e.target.value})} placeholder="简短说明..."/></div>
      </Modal>}
      {del&&<Modal title="⚠️" onClose={()=>setDel(null)} footer={<><Btn v="outline" onClick={()=>setDel(null)}>{t.cancel}</Btn><Btn v="red" onClick={async()=>{await persist(apps.filter(a=>a.id!==del.id));setDel(null);}}>🗑️ {t.del}</Btn></>}><p style={{fontSize:14}}>{t.confirmDel}</p><p style={{fontWeight:700,marginTop:8}}>{del.name}</p></Modal>}
    </div>
  );
}

/* ══════════  QUIZ MASTER (Teacher) ══════════
   ✅ FIX 1: gameRef avoids stale closure in polling interval
   ✅ FIX 2: questions saved to storage, survive logout
   ✅ FIX 3: restore active game on mount
════════════════════════════════════════════ */
function QuizMaster({students,t}){
  const emptyQ=()=>({id:uid(),q:'',options:['','','',''],correct:0});
  const[qs,setQs]=useState([emptyQ()]);
  const[game,setGame]=useState(null);
  const[responses,setResponses]=useState({});
  const[scores,setScores]=useState({});
  const[saveMsg,setSaveMsg]=useState('');
  const gameRef=useRef(null);   // ✅ avoids stale closure
  const scoresRef=useRef({});   // ✅ scores accessible inside interval

  // ✅ FIX: load saved questions and restore active game on mount
  useEffect(()=>{
    db.get('p_quiz_qs',null).then(saved=>{
      if(saved?.length)setQs(saved);
    });
    db.get('s_game',null,true).then(g=>{
      if(g?.type==='quiz'){
        setGame(g);gameRef.current=g;
        // Restore scores from storage if available
        db.get('p_quiz_scores',{}).then(sc=>{ setScores(sc); scoresRef.current=sc; });
      }
    });
  },[]);

  // ✅ FIX: single persistent interval using gameRef (no stale closure)
  useEffect(()=>{
    const iv=setInterval(async()=>{
      if(!gameRef.current?.active)return;
      const resps={};
      for(const s of students){
        const r=await db.get(`s_resp_${s.id}`,null,true);
        // ✅ match both gameId AND questionIdx
        if(r?.gameId===gameRef.current.id&&r?.questionIdx===gameRef.current.questionIdx)
          resps[s.id]=r;
      }
      setResponses(resps);
    },1000);
    return()=>clearInterval(iv);
  },[students]); // runs once, uses ref

  const setGameAndRef=g=>{setGame(g);gameRef.current=g;};
  const setScoresAndRef=sc=>{setScores(sc);scoresRef.current=sc;db.set('p_quiz_scores',sc);};

  const updateGame=async u=>{
    const g={...gameRef.current,...u};
    await db.set('s_game',g,true);
    setGameAndRef(g);
  };

  // ✅ Save questions to storage
  const saveQuestions=async()=>{
    await db.set('p_quiz_qs',qs);
    setSaveMsg(t.quizSaved);setTimeout(()=>setSaveMsg(''),2000);
  };

  const startQuiz=async()=>{
    const validQs=qs.filter(q=>q.q.trim());if(!validQs.length)return;
    const sc={};students.forEach(s=>sc[s.id]=0);setScoresAndRef(sc);
    const g={id:uid(),type:'quiz',active:true,questionIdx:0,
      question:validQs[0].q,options:validQs[0].options,correctIdx:validQs[0].correct,
      showAnswer:false,questions:validQs};
    await db.set('s_game',g,true);
    for(const s of students)await db.del(`s_resp_${s.id}`,true);
    setGameAndRef(g);setResponses({});
  };

  const nextQuestion=async()=>{
    const next=(gameRef.current.questionIdx||0)+1;
    if(next>=gameRef.current.questions.length){
      await updateGame({active:false,showAnswer:false});return;
    }
    const q=gameRef.current.questions[next];
    for(const s of students)await db.del(`s_resp_${s.id}`,true);
    setResponses({});
    await updateGame({questionIdx:next,question:q.q,options:q.options,correctIdx:q.correct,showAnswer:false});
  };

  const reset=async()=>{
    await db.del('s_game',true);await db.del('p_quiz_scores');
    for(const s of students)await db.del(`s_resp_${s.id}`,true);
    setGameAndRef(null);setResponses({});setScoresAndRef({});
  };

  const markCorrect=sid=>{
    const sc={...scoresRef.current,[sid]:(scoresRef.current[sid]||0)+1};
    setScoresAndRef(sc);
  };

  // ─── Setup screen ───────────────────────────
  if(!game)return(
    <div style={C.card}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div className="fredoka" style={{fontSize:18,color:'#064e3b'}}>{t.qzTitle}</div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {saveMsg&&<span style={{fontSize:12,color:'#16a34a',fontWeight:700}}>{saveMsg}</span>}
          <Btn v="ghost" size="sm" onClick={saveQuestions}>💾 {t.saveQuiz}</Btn>
        </div>
      </div>
      {qs.map((q,qi)=>(
        <div key={q.id} style={{background:'#f9fafb',borderRadius:10,padding:14,marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <label style={{...C.lbl,marginBottom:0,fontSize:13}}>Q{qi+1}. {t.qQ}</label>
            {qs.length>1&&<button onClick={()=>{const nq=qs.filter((_,i)=>i!==qi);setQs(nq);db.set('p_quiz_qs',nq);}} style={{background:'none',border:'none',color:'#dc2626',cursor:'pointer',fontWeight:700,fontSize:12,fontFamily:'inherit'}}>✕ 删除</button>}
          </div>
          <div style={C.fg}><input style={C.inp} value={q.q} onChange={e=>setQs(p=>p.map((x,i)=>i===qi?{...x,q:e.target.value}:x))} placeholder="输入题目..."/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
            {q.options.map((o,oi)=>(
              <div key={oi} style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:12,fontWeight:700,color:'#9ca3af',width:16,flexShrink:0}}>{String.fromCharCode(65+oi)}.</span>
                <input style={{...C.inp,flex:1,borderColor:q.correct===oi?'#16a34a':'#e5e7eb',background:q.correct===oi?'#f0fdf4':'#fff'}} value={o} onChange={e=>setQs(p=>p.map((x,i)=>i===qi?{...x,options:x.options.map((op,j)=>j===oi?e.target.value:op)}:x))} placeholder={`选项 ${String.fromCharCode(65+oi)}`}/>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
            <span style={{fontSize:12.5,fontWeight:700,color:'#6b7280'}}>✅ 正确答案：</span>
            {q.options.map((o,oi)=>(
              <button key={oi} onClick={()=>setQs(p=>p.map((x,i)=>i===qi?{...x,correct:oi}:x))}
                style={{padding:'4px 12px',border:`2px solid ${q.correct===oi?'#16a34a':'#e5e7eb'}`,borderRadius:20,background:q.correct===oi?'#f0fdf4':'#fff',color:q.correct===oi?'#166534':'#6b7280',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
                {String.fromCharCode(65+oi)}{o?`: ${o.slice(0,10)}${o.length>10?'…':''}`:''}              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
        <Btn v="ghost" size="sm" onClick={()=>{const nq=[...qs,emptyQ()];setQs(nq);db.set('p_quiz_qs',nq);}}>+ {t.addQ}</Btn>
        <Btn v="green" disabled={qs.every(q=>!q.q.trim())} onClick={startQuiz} style={{marginLeft:'auto'}}>🚀 {t.startGame} ({qs.filter(q=>q.q.trim()).length}题)</Btn>
      </div>
    </div>
  );

  // ─── Results screen ─────────────────────────
  if(!game.active&&game.questions){
    const sorted=[...students].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0));
    return(
      <div style={C.card}>
        <div className="fredoka" style={{fontSize:22,color:'#064e3b',textAlign:'center',marginBottom:4}}>🎉 {t.results}</div>
        <div style={{textAlign:'center',fontSize:13,color:'#6b7280',marginBottom:20}}>共 {game.questions.length} 题</div>
        {sorted.map((s,i)=>{
          const sc=scores[s.id]||0;
          const pct=game.questions.length>0?Math.round(sc/game.questions.length*100):0;
          const barClr=pct>=80?'#16a34a':pct>=50?'#f59e0b':'#dc2626';
          return(
            <div key={s.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:12,background:i===0?'#fffbeb':'#f9fafb',border:i===0?'2px solid #f59e0b':'2px solid #f3f4f6',marginBottom:10}}>
              <span style={{fontSize:22,width:28,textAlign:'center',flexShrink:0}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':'  '}</span>
              <Avatar name={s.name} size={36}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15}}>{s.name}</div>
                <div style={{height:7,background:'#e5e7eb',borderRadius:4,marginTop:5,overflow:'hidden'}}>
                  <div style={{height:'100%',background:barClr,borderRadius:4,width:`${pct}%`,transition:'width .5s'}}/>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div className="fredoka" style={{fontSize:24,color:'#064e3b'}}>{sc}<span style={{fontSize:13,color:'#9ca3af'}}>/{game.questions.length}</span></div>
                <div style={{fontSize:11,color:barClr,fontWeight:700}}>{pct}%</div>
              </div>
            </div>
          );
        })}
        <Btn v="green" full onClick={reset} style={{marginTop:12}}>🔄 {t.reset}</Btn>
      </div>
    );
  }

  // ─── Active quiz screen ──────────────────────
  const answeredCount=Object.keys(responses).length;
  return(
    <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      {/* Left: current question */}
      <div style={C.card}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
          <Badge c="gold">Q{(game.questionIdx||0)+1}/{game.questions.length}</Badge>
          <Badge c="green">进行中</Badge>
        </div>
        <div style={{fontWeight:800,fontSize:16,color:'#064e3b',marginBottom:14,lineHeight:1.4}}>{game.question}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
          {game.options.map((o,i)=>(
            <div key={i} style={{padding:'9px 11px',borderRadius:8,background:game.showAnswer&&i===game.correctIdx?'#f0fdf4':'#f9fafb',border:`2px solid ${game.showAnswer&&i===game.correctIdx?'#16a34a':'#e5e7eb'}`,fontSize:13,fontWeight:700,display:'flex',gap:7,alignItems:'center'}}>
              <span style={{opacity:.5,flexShrink:0}}>{String.fromCharCode(65+i)}.</span>{o}
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {!game.showAnswer&&<Btn v="gold" onClick={()=>updateGame({showAnswer:true})}>👁️ {t.reveal}</Btn>}
          {game.showAnswer&&<Btn v="green" onClick={nextQuestion}>{(game.questionIdx||0)<game.questions.length-1?`${t.next} →`:`🏁 ${t.finish}`}</Btn>}
          <Btn v="outline" onClick={reset}>{t.reset}</Btn>
        </div>
      </div>

      {/* Right: student responses */}
      <div style={C.card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div className="fredoka" style={{fontSize:15,color:'#064e3b'}}>{t.responses}</div>
          <Badge c={answeredCount===students.length&&students.length>0?'green':'gold'}>{answeredCount}/{students.length}</Badge>
        </div>
        {students.length===0
          ?<Empty icon="👥" text="请先添加学生"/>
          :students.map(s=>{
            const r=responses[s.id];const ans=r?.data?.ansIdx;
            return(
              <div key={s.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,marginBottom:6,background:'#f9fafb'}}>
                <Avatar name={s.name} size={28}/>
                <span style={{fontWeight:700,flex:1,fontSize:13}}>{s.name}</span>
                {ans!==undefined?(
                  <>
                    {game.showAnswer
                      ?(ans===game.correctIdx?<Badge c="green">✅ {String.fromCharCode(65+ans)}</Badge>:<Badge c="red">❌ {String.fromCharCode(65+ans)}</Badge>)
                      :<Badge c="blue">已答 {String.fromCharCode(65+ans)}</Badge>}
                    {game.showAnswer&&(
                      <button onClick={()=>markCorrect(s.id)}
                        style={{padding:'4px 10px',border:'none',background:'#f0fdf4',color:'#166634',borderRadius:6,fontWeight:700,fontSize:11.5,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                        +分 ({scores[s.id]||0})
                      </button>
                    )}
                  </>
                ):<Badge c="gray">{t.notAnswered}</Badge>}
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* ── Settings ────────────────────────────────── */
function Settings({t,lang,setLang,students}){
  const[cur,setCur]=useState('');const[nw,setNw]=useState('');const[cfm,setCfm]=useState('');const[msg,setMsg]=useState(null);
  const[reflections,setReflections]=useState([]);const[loadingR,setLoadingR]=useState(false);
  const change=async()=>{
    const stored=await db.get('p_pwd','pandan2024');
    if(cur!==stored){setMsg({ok:false,txt:t.pwdWrong});return;}
    if(nw!==cfm){setMsg({ok:false,txt:t.pwdMismatch});return;}
    if(!nw.trim())return;
    await db.set('p_pwd',nw);setCur('');setNw('');setCfm('');setMsg({ok:true,txt:t.pwdOk});setTimeout(()=>setMsg(null),4000);
  };
  const loadR=async()=>{
    setLoadingR(true);const all=[];
    for(const s of students){const r=await db.get(`s_refl_${s.id}`,[],true);all.push(...r);}
    all.sort((a,b)=>new Date(b.date)-new Date(a.date));setReflections(all);setLoadingR(false);
  };
  return(
    <div>
      <PH title={`⚙️ ${t.n.settings}`}/>
      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={C.card}>
          <div className="fredoka" style={{fontSize:17,color:'#064e3b',marginBottom:16}}>{t.pwdTitle}</div>
          {msg&&<div style={{padding:'9px 13px',borderRadius:8,marginBottom:14,fontSize:13,fontWeight:600,background:msg.ok?'#f0fdf4':'#fef2f2',color:msg.ok?'#166534':'#991b1b'}}>{msg.txt}</div>}
          <div style={C.fg}><label style={C.lbl}>{t.curPwd}</label><input style={C.inp} type="password" value={cur} onChange={e=>setCur(e.target.value)}/></div>
          <div style={C.fg}><label style={C.lbl}>{t.newPwd}</label><input style={C.inp} type="password" value={nw} onChange={e=>setNw(e.target.value)}/></div>
          <div style={C.fg}><label style={C.lbl}>{t.cfmPwd}</label><input style={C.inp} type="password" value={cfm} onChange={e=>setCfm(e.target.value)}/></div>
          <Btn v="green" onClick={change}>🔐 {t.changePwd}</Btn>
        </div>
        <div style={C.card}>
          <div className="fredoka" style={{fontSize:17,color:'#064e3b',marginBottom:16}}>{t.langTitle}</div>
          <div style={{display:'flex',gap:10,marginBottom:20}}><Btn v={lang==='zh'?'green':'outline'} onClick={()=>setLang('zh')}>🇨🇳 中文</Btn><Btn v={lang==='en'?'green':'outline'} onClick={()=>setLang('en')}>🇬🇧 English</Btn></div>
          <div style={{background:'#f0fdf4',borderRadius:10,padding:14}}>
            <div style={{fontSize:13,fontWeight:700,color:'#166534',marginBottom:8}}>📋 {t.howTo}</div>
            <div style={{fontSize:12.5,color:'#374151',lineHeight:1.9}}>
              1️⃣ 老师登录 → 添加学生名单<br/>
              2️⃣ 在"游戏 → 小游戏"添加 Web App 链接<br/>
              3️⃣ 学生打开同一网址 → 选名字进入<br/>
              4️⃣ 学生可以玩游戏、上传作品、写感想 ✨
            </div>
          </div>
        </div>
      </div>
      <div style={C.card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div className="fredoka" style={{fontSize:17,color:'#064e3b'}}>📝 查看学生感想</div>
          <Btn v="ghost" size="sm" onClick={loadR}>{loadingR?'加载中...':'🔄 加载感想'}</Btn>
        </div>
        {reflections.length===0
          ?<div style={{color:'#9ca3af',fontSize:13,textAlign:'center',padding:'20px 0'}}>点击"加载感想"查看学生提交的内容</div>
          :reflections.map(r=>(
            <div key={r.id} style={{padding:'12px 0',borderBottom:'1px solid #f3f4f6'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}><Avatar name={r.studentName} size={26}/><span style={{fontWeight:700,fontSize:13}}>{r.studentName}</span></div>
                <Badge c="gray">{r.date}</Badge>
              </div>
              <div style={{fontSize:13.5,color:'#374151',lineHeight:1.6,paddingLeft:34}}>{r.text}</div>
            </div>
          ))}
      </div>
    </div>
  );
}


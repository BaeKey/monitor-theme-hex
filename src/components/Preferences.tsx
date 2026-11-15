import {TableDisplaySettings} from './TableControls'
import type {Browse} from '@/lib/browse'
import {Select} from '@/components/ui/select'
import { tr, getLanguage, subscribeLanguage, setLanguage } from '../lib/i18n.ts'
import {X, Check, Circle, Minus, BarChart3, Hash, Rows2, Rows3} from 'lucide-react';
import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { palettes, graphStyles, moduleLabels, cardInfoLabels, type CardInfo, defaultCardInfo, type DisplayPatch, safeBackground, type Preferences as Prefs } from '@/lib/appearance';
const slimCardInfo: CardInfo = {...defaultCardInfo,connections:false,uptime:false};
function InfoPresets({value,onChange,mobile=false}:{value:CardInfo;onChange:(next:CardInfo)=>void;mobile?:boolean}) {
    const matches=(preset:CardInfo)=>Object.keys(defaultCardInfo).every(key=>value[key as keyof CardInfo]===preset[key as keyof CardInfo]);
    const full=matches(defaultCardInfo),slim=matches(slimCardInfo);
    return <div className="info-presets"><div className="preset-heading"><span>{tr("辅助信息方案")}</span><small>{full?tr("完整"):slim?tr("精简"):tr("自定义")}</small></div><div role="group" aria-label={mobile?tr("手机显示预设"):tr("通用显示预设")}>
      <button aria-pressed={full} onClick={()=>onChange({...defaultCardInfo})}><span>{full&&<Check size={14}/ >}{tr("完整")}</span><small>{tr("显示全部辅助信息")}</small></button>
      <button aria-pressed={slim} onClick={()=>onChange({...slimCardInfo})}><span>{slim&&<Check size={14}/ >}{tr("精简")}</span><small>{tr("隐藏连接数与在线时长")}</small></button>
    </div></div>;
}
function BackgroundInput({ value, onChange }: {
    value: string;
    onChange: (url: string) => void;
}) {
    const [draft, setDraft] = useState(value);
    const [error, setError] = useState('');
    return <div className="background-input"><label>{tr("背景图片地址")}<input aria-label={tr("背景图片地址")} value={draft} placeholder={tr("https://… 或 /background.svg")} onChange={e => setDraft(e.target.value)}/></label><button onClick={() => { const url = safeBackground(draft); if (draft.trim() && !url)
        setError(tr("请输入 HTTP(S) 地址或站内绝对路径"));
    else {
        setError('');
        onChange(url);
    } }}>{tr("应用背景")}</button>{error && <p role="alert">{error}</p>}</div>;
}
function ResetConfirmation({onCancel,onConfirm}:{onCancel:()=>void;onConfirm:()=>void}) {
    const ref=useRef<HTMLDialogElement>(null);
    useEffect(()=>{const trigger=document.activeElement as HTMLElement|null,element=ref.current!;element.showModal();return()=>{element.close();trigger?.focus({preventScroll:true})}},[]);
    return <dialog ref={ref} className="settings-reset-confirm" aria-labelledby="reset-confirm-title" onCancel={event=>{event.preventDefault();onCancel()}}><h3 id="reset-confirm-title">{tr("重置全部偏好？")}</h3><p>{tr("将恢复站点默认外观与显示设置，并清除表格列、语言和浏览筛选。此操作无法撤销。")}</p><div><button autoFocus onClick={onCancel}>{tr("取消")}</button><button className="confirm-destructive" onClick={onConfirm}>{tr("确认重置")}</button></div></dialog>;
}
export function Preferences({ browse, onTableChange, onClose, value, onChange, onGraphChange, onDisplayChange, onReset, onExport, onImport, backgroundError }: {
    browse:Browse;
    onTableChange:(patch:Partial<Browse>)=>void;
    onClose:()=>void;
    value: Prefs;
    onChange: (next: Prefs) => void;
    onGraphChange: (graph: Prefs['graph']) => void;
    onDisplayChange: (patch: DisplayPatch) => void;
    onReset: (scope: 'appearance' | 'all') => void;
    onExport: () => string;
    onImport: (text:string) => 'legacy'|'bundle';
    backgroundError: boolean;
}) {
    const language = useSyncExternalStore(subscribeLanguage, getLanguage);
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(()=>{
        const trigger=document.activeElement as HTMLElement | null;
        const overflow=document.body.style.overflow;
        const element=dialog.current!;
        element.showModal(); document.body.style.overflow='hidden';
        return ()=>{element.close(); document.body.style.overflow=overflow; trigger?.focus({preventScroll:true});};
    },[]);
    const [category,setCategory]=useState('appearance');
    const [message, setMessage] = useState('');
    const [confirmReset,setConfirmReset]=useState(false);
    const patch = (next: Partial<Prefs>) => onChange({ ...value, ...next });
    const range = (label: string, key: 'backgroundBlur' | 'backgroundMask' | 'cardOpacity' | 'cardBlur', min: number, max: number, unit: string) => <label className="range-control">{label}<output>{value[key]}{unit}</output><input type="range" aria-label={label} min={min} max={max} value={value[key]} onChange={e => patch({ [key]: Number(e.target.value) })}/></label>;
    return <dialog ref={dialog} className="settings-drawer" aria-label={tr("显示与偏好")} onCancel={onClose}><section className="preferences" data-category={category} aria-label={tr("显示与偏好")}>
    <div className="settings-top"><h2>{tr("显示与偏好")}</h2><button aria-label={tr("关闭设置")} title={tr("关闭设置")} onClick={onClose}><X size={20}/></button></div>
    <div hidden={category!=='other'} className="settings-language"><span>语言 / Language</span><div role="group" aria-label="Language / 语言"><button lang="zh-CN" aria-pressed={language==='zh'} onClick={()=>setLanguage('zh')}>简体中文</button><button lang="en" aria-pressed={language==='en'} onClick={()=>setLanguage('en')}>English</button></div></div>
    <p className="preferences-note">{tr("仅保存在当前浏览器；未修改的选项跟随站点默认。")}</p>
    <nav className="settings-nav" aria-label={tr("设置分类")}>{([['appearance','外观'],['cards','显示内容'],['network','网络'],['other','偏好']] as const).map(([id,label])=><button key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}>{tr(label)}</button>)}</nav>
    <div className="recommended-display" hidden={category!=='cards'}><button onClick={()=>{onChange({...value,graph:'bar'});onGraphChange('bar');setMessage(tr("已应用推荐显示"))}}>{tr("应用本站推荐显示")}</button><p className="preferences-note">{tr("修改资源样式为细条；保留已选字段和其他偏好。")}</p></div>
    <fieldset hidden={category!=='appearance'} data-settings="appearance"><legend>{tr("常用外观")}</legend><div className="preference-grid"><div className="visual-preference"><span>{tr("主题配色")}</span><div className="palette-options" role="group" aria-label={tr("主题配色")}>{Object.entries(palettes).map(([k,v],i)=><button key={k} title={tr(v)} aria-label={tr(v)} aria-pressed={value.palette===k} style={{'--swatch':['#4268aa','#167e90','#b65b2c','#248064','#7860bb','#b24e77'][i]} as React.CSSProperties} onClick={()=>patch({palette:k as Prefs['palette']})}><i/></button>)}</div></div>
      <label>{tr("明暗模式")}<Select aria-label={tr("明暗模式")} value={value.appearance} onChange={e => patch({ appearance: e.target.value as Prefs['appearance'] })}><option value="system">{tr("跟随系统")}</option><option value="light">{tr("浅色")}</option><option value="dark">{tr("深色")}</option></Select></label>
    </div></fieldset>
    <fieldset hidden={category!=='cards'} data-settings="card-info"><legend>{tr("卡片信息")}</legend><InfoPresets value={value.cardInfo} onChange={cardInfo=>onDisplayChange({cardInfo})}/><div className="card-info-switches" role="group" aria-label={tr("通用卡片信息")}>{Object.entries(cardInfoLabels).map(([key,label])=><label className="check-control" key={key}><input type="checkbox" checked={value.cardInfo[key as keyof Prefs['cardInfo']]} onChange={e=>onDisplayChange({cardInfo:{[key]:e.target.checked}})}/>{tr(label)}</label>)}</div>
    <div className="mobile-info-control"><label>{tr("手机显示")}<Select aria-label={tr("手机显示")} value={value.mobileInfoMode} onChange={e=>onDisplayChange({mobileInfoMode:e.target.value as Prefs['mobileInfoMode'],...(e.target.value==='custom' && value.mobileCardInfo===null?{mobileCardInfo:{...value.cardInfo}}:{})})}><option value="follow">{tr("跟随通用设置")}</option><option value="custom">{tr("单独设置")}</option></Select></label></div>
    {value.mobileInfoMode==='follow' && <p className="preferences-note mobile-follow-note">{tr("手机正在使用上方通用设置；切换为单独设置后可独立调整。")}</p>}
    {value.mobileInfoMode==='custom' && <div className="mobile-info-options"><InfoPresets mobile value={value.mobileCardInfo || value.cardInfo} onChange={mobileCardInfo=>onDisplayChange({mobileCardInfo})}/><p className="preferences-note">{tr("仅影响宽度不超过 720px 的首页卡片。")}</p><div className="card-info-switches" role="group" aria-label={tr("手机卡片信息")}>{Object.entries(cardInfoLabels).map(([key,label])=><label className="check-control" key={key}><input type="checkbox" checked={(value.mobileCardInfo || value.cardInfo)[key as keyof Prefs['cardInfo']]} onChange={e=>onDisplayChange({mobileCardInfo:{...(value.mobileCardInfo || value.cardInfo),[key]:e.target.checked}})}/>{tr(label)}</label>)}</div></div>}
    </fieldset>
    <fieldset hidden={category!=='appearance'} data-settings="layout"><legend>{tr("卡片布局")}</legend><div className="card-layout-controls"><div className="preference-grid"><div className="visual-preference"><span>{tr("卡片密度")}</span><div className="density-options" role="group" aria-label={tr("卡片密度")}>{(['comfortable','compact'] as const).map(k=><button key={k} aria-pressed={value.layout===k} onClick={()=>patch({layout:k})}>{k==='compact'?<Rows3 size={22}/>:<Rows2 size={22}/>}<small>{tr(k==='compact'?"紧凑":"舒适")}</small></button>)}</div></div><label>{tr("桌面列数")} <small>{tr("仅桌面生效")}</small><Select aria-label={tr("桌面列数")} value={value.desktopColumns} onChange={e=>onDisplayChange({desktopColumns:e.target.value as Prefs['desktopColumns']})}><option value="auto">{tr("自动")}</option>{(['2','3','4'] as const).map(n=><option key={n} value={n}>{tr("{0} 列",n)}</option>)}</Select></label></div></div></fieldset>
    <fieldset hidden={category!=='appearance'} data-settings="indicators"><legend>{tr("指标与图标")}</legend><div className="preference-grid">      <div className="visual-preference"><span>{tr("指标样式")}</span><div className="graph-options" role="group" aria-label={tr("指标样式")}>{Object.entries(graphStyles).map(([k,v])=>{const Icon=k==='ring'?Circle:k==='bar'?Minus:k==='columns'?BarChart3:Hash;return <button key={k} aria-label={tr(v)} aria-pressed={value.graph===k} onClick={()=>onGraphChange(k as Prefs['graph'])}><Icon size={22}/><small>{tr(v)}</small></button>})}</div></div>      <label className="check-control"><input type="checkbox" checked={value.showTotals} onChange={e => patch({ showTotals: e.target.checked })}/>{tr("显示已用 / 总容量")}</label>      <label className="check-control"><input type="checkbox" checked={value.icons} onChange={e => patch({ icons: e.target.checked })}/>{tr("国旗与系统图标")}</label></div></fieldset>
    <p hidden={category!=='appearance'} className="preferences-note">{tr("指标样式影响资源指标；首页网速显示趋势波浪线，延迟显示采样柱条。")}</p>
    <fieldset hidden={category!=='cards'} data-settings="home"><legend>{tr("首页模块")}</legend><div className="module-switches">{Object.entries(moduleLabels).map(([key, label]) => <label className="check-control" key={key}><input type="checkbox" aria-label={tr(label)} checked={value.modules[key as keyof typeof moduleLabels]} onChange={e => patch({ modules: { ...value.modules, [key]: e.target.checked } })}/>{tr(label)}{key==='map'&&<small>{tr("仅桌面生效")}</small>}</label>)}</div><p className="preferences-note">{tr("高负载提示在 CPU 达到 85% 时记录，低于 80% 时标记恢复；记录仅保存在当前浏览器。")}</p></fieldset>
    <fieldset hidden={category!=='cards'} data-settings="table"><legend>{tr("表格显示")}</legend><TableDisplaySettings browse={browse} onChange={onTableChange}/></fieldset>
    <section hidden={category!=='appearance'} className="advanced-appearance"><h3>{tr("高级外观")}</h3><fieldset><legend>{tr("背景与质感")}</legend>
      <BackgroundInput key={value.backgroundUrl} value={value.backgroundUrl} onChange={backgroundUrl => patch({ backgroundUrl })}/>
      <div className="background-presets"><button onClick={() => patch({ backgroundUrl: '/background.svg' })}>{tr("使用内置山峦")}</button><button onClick={() => patch({ backgroundUrl: '' })}>{tr("清除背景")}</button></div>
      {backgroundError && <p className="preferences-note" role="alert">{tr("背景加载失败，已使用默认底色。请检查图片地址。")}</p>}
      <div className="preference-grid">
        <label>{tr("背景效果")}<Select aria-label={tr("背景效果")} value={value.backgroundType} onChange={e => patch({ backgroundType: e.target.value as Prefs['backgroundType'] })}><option value="soft">{tr("柔和模糊")}</option><option value="glass">{tr("玻璃质感")}</option></Select></label>
        {range(tr("背景模糊"), 'backgroundBlur', 0, 30, 'px')}{range(tr("背景遮罩"), 'backgroundMask', 0, 90, '%')}
        <label className="check-control"><input type="checkbox" checked={value.glass} onChange={e => patch({ glass: e.target.checked })}/>{tr("开启卡片毛玻璃")}</label>
        {range(tr("卡片不透明度"), 'cardOpacity', 55, 100, '%')}{range(tr("卡片模糊"), 'cardBlur', 0, 24, 'px')}
      </div><p className="preferences-note">{tr("手机端会降低模糊强度。外部背景图片仅在设置后加载。")}</p>
    </fieldset></section>
    <div hidden={category!=='other'} className="settings-reset"><h3>{tr("偏好管理")}</h3><p className="preferences-note">{tr("恢复外观保留显示内容；全部重置将恢复站点默认并清空筛选。")}</p><p className="preferences-note">{tr("主题配置包含外观、显示、网络、表格列与语言；不包含账号、节点数据或临时筛选。")}</p>
    <div className="preference-actions">
      <div className="preference-action-group">
      <button onClick={() => { try { const url = URL.createObjectURL(new Blob([onExport()], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'monitor-hex-settings.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage(tr("主题配置已导出")); } catch (error) { setMessage(error instanceof Error?error.message:tr("导出失败")); } }}>{tr("导出主题配置")}</button>
      <label className="import-control">{tr("导入主题配置")}<input type="file" accept="application/json,.json" aria-label={tr("导入主题配置")} onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file)
                return;
            try {
                if (file.size > 262144)
                    throw new Error(tr("配置文件不能超过 256 KB"));
                const kind=onImport(await file.text());
                setMessage(tr(kind==='legacy'?"旧版外观偏好已导入":"主题配置已导入"));
            }
            catch (error) {
                setMessage(error instanceof Error ? error.message : tr("导入失败"));
            }
        }}/></label>
      </div>
      <div className="preference-action-group">
      <button onClick={() => { onReset('appearance'); setMessage(tr("外观已恢复站点默认，首页模块和筛选已保留")); }}>{tr("恢复默认外观")}</button>
      <button onClick={() => setConfirmReset(true)}>{tr("重置全部偏好")}</button>
      </div>
    </div>
    </div>{message && <p role="status" className="preferences-note">{message}</p>}
  </section>{confirmReset&&<ResetConfirmation onCancel={()=>setConfirmReset(false)} onConfirm={()=>{onReset('all');setConfirmReset(false);setMessage(tr("全部本地偏好已恢复，浏览筛选已清空"))}}/>}</dialog>;
}

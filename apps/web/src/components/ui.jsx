import { useEffect, useId, useRef } from 'react';
import clsx from 'clsx';
import { LoaderCircle, X } from 'lucide-react';
import { initials } from '../lib/format';
export function Button({ children, className, variant = 'primary', loading, ...props }) {
    const styles = { primary: 'bg-violet text-white shadow-lg shadow-violet/20 hover:bg-[#4237c0] dark:hover:bg-[#9f96ff] dark:hover:text-[#171326]', secondary: 'bg-violet/10 text-violet hover:bg-violet/15 dark:bg-violet/20', ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10', danger: 'bg-coral text-white hover:bg-[#a84332] dark:hover:bg-[#ff9b87] dark:hover:text-[#351914]' };
    return <button className={clsx('inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-[background,color,box-shadow,transform] duration-150 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-55', styles[variant], className)} disabled={loading || props.disabled} {...props}>{loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true"/>}{children}</button>;
}
export function Card({ children, className }) { return <section className={clsx('surface', className)}>{children}</section>; }
export function Avatar({ user, size = 'md' }) { const sizes = { sm: 'size-7 text-[10px]', md: 'size-9 text-xs', lg: 'size-12 text-sm' }; return user?.avatarUrl ? <img src={user.avatarUrl} alt={`${user.name ?? 'Member'} avatar`} className={clsx('rounded-full object-cover', sizes[size])}/> : <span aria-label={user?.name ?? 'Member'} className={clsx('inline-grid shrink-0 place-items-center rounded-full font-bold text-white', sizes[size])} style={{ background: user?.avatarColor ?? '#5045d8' }}>{initials(user?.name)}</span>; }
export function Modal({ open, onClose, title, children }) {
    const titleId = useId();
    const dialog = useRef(null);
    useEffect(() => { if (!open)
        return; const previous = document.activeElement; const original = document.body.style.overflow; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => dialog.current?.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus()); const keydown = (event) => { if (event.key === 'Escape')
        onClose(); if (event.key !== 'Tab' || !dialog.current)
        return; const focusable = [...dialog.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]; if (!focusable.length)
        return; const first = focusable[0], last = focusable.at(-1); if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    }
    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    } }; document.addEventListener('keydown', keydown); return () => { document.body.style.overflow = original; document.removeEventListener('keydown', keydown); previous?.focus(); }; }, [open, onClose]);
    if (!open)
        return null;
    return <div className="fixed inset-0 z-50 flex items-end bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget)
        onClose(); }} role="presentation"><div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} className="max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-[1.4rem] bg-paper p-5 shadow-float sm:max-h-[88vh] sm:max-w-xl sm:rounded-2xl sm:p-6"><div className="mb-5 flex items-center justify-between"><h2 id={titleId} className="text-lg font-bold tracking-tight">{title}</h2><button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-black/5 dark:hover:bg-white/10" aria-label={`Close ${title}`}><X className="size-5"/></button></div>{children}</div></div>;
}
export function Empty({ icon, title, description, action }) { return <Card className="grid min-h-56 place-items-center p-8 text-center"><div><div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-violet/10 text-violet">{icon}</div><h3 className="font-bold">{title}</h3>{description && <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">{description}</p>}{action && <div className="mt-4">{action}</div>}</div></Card>; }
export function Skeleton({ className }) { return <div aria-hidden="true" className={clsx('skeleton rounded-xl', className)}/>; }
export function Metric({ label, value, hint, tone = 'default' }) { return <Card className="min-w-0 p-4 sm:p-5"><p className="eyebrow">{label}</p><p className={clsx('amount mt-2 overflow-hidden text-ellipsis text-2xl font-bold tracking-tight', tone === 'positive' && 'text-mint', tone === 'negative' && 'text-coral')}>{value}</p>{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</Card>; }

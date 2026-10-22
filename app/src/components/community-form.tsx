'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ContributionKind, ContributionProject } from '@/lib/community/input';
import styles from './community.module.css';

async function newToken(): Promise<string> {
  const response = await fetch('/api/community/challenge', { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw Error(data.error || 'Could not open the form.');
  return data.token;
}
export default function CommunityForm({ projects, available, initialProject = '', initialLineage = '', initialKind = 'promise' }: {
  projects: ContributionProject[]; available: boolean; initialProject?: string; initialLineage?: string; initialKind?: ContributionKind;
}) {
  const [kind, setKind] = useState<ContributionKind>(initialKind);
  const [slug, setSlug] = useState(initialProject);
  const [lineage, setLineage] = useState(initialLineage);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [receipt, setReceipt] = useState('');
  const token = useRef('');
  const pending = useRef<Record<string, unknown> | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const project = projects.find(p => p.slug === slug);
  const promise = project?.promises.find(p => p.lineage === lineage);
  useEffect(() => {
    if (!available) return;
    let active = true;
    newToken().then(value => { if (active) token.current = value; }).catch(() => { if (active) setMessage('Could not open the form. Reload to try again.'); });
    return () => { active = false; };
  }, [available]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      if (!token.current) { token.current = await newToken(); throw Error('Please take a moment, then try again.'); }
      // Retry the exact payload after a lost response, even if the visitor edits the form.
      const fields = pending.current ?? { ...Object.fromEntries(new FormData(event.currentTarget)),
        kind, project_slug: slug, project_name: project?.name ?? new FormData(event.currentTarget).get('project_name'),
        lineage: kind === 'promise' ? '' : lineage, claim: kind === 'promise' ? new FormData(event.currentTarget).get('claim') : promise?.claim ?? '',
        deadline: kind === 'promise' ? new FormData(event.currentTarget).get('deadline') : '', token: token.current };
      pending.current = fields;
      const response = await fetch('/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
      const data = await response.json();
      if (!response.ok) {
        if (response.status < 500) pending.current = null;
        if (response.status === 409 || /Reload|moment/.test(data.error ?? '')) token.current = await newToken();
        throw Error(data.error || 'Could not save your contribution. Please try again.');
      }
      pending.current = null;
      setReceipt(data.receipt);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not confirm receipt. Retry to check the same submission.'); }
    finally { setBusy(false); }
  }
  if (receipt) return <section className={styles.success} role="status">
    <p className={styles.eyebrow}>Submission received</p><h2>Your source is in the review queue.</h2>
    <p>We will check the original claim, source and context. It has not changed the published assessment.</p>
    <p><Link href={receipt}>Keep your tracking receipt →</Link></p>
    <p className={styles.muted}>Save that link to check the review result. No account or email required.</p>
  </section>;
  return <form ref={form} onSubmit={submit} className={styles.form}>
    {!available && <p role="status" className={styles.notice}>Submissions are temporarily unavailable. Your work has not been sent. Please try again later.</p>}
    <fieldset disabled={!available || busy}>
      <legend>What would you like to contribute?</legend>
      <div className={styles.kindChoices}>{([
        ['promise', 'Submit a promise'], ['evidence', 'Add evidence'], ['challenge', 'Challenge an assessment'],
      ] as const).map(([value, label]) => <label key={value} className={kind === value ? styles.selected : ''}>
        <input type="radio" name="kindChoice" value={value} checked={kind === value} onChange={() => setKind(value)} />{label}
      </label>)}</div>
      <label>Project<select value={slug} onChange={event => { setSlug(event.target.value); setLineage(''); }} required={kind !== 'promise'}>
        <option value="">{kind === 'promise' ? 'A project not listed here' : 'Choose a project'}</option>
        {projects.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
      </select></label>
      {!project && kind === 'promise' && <label>Project name<input name="project_name" required minLength={2} maxLength={120} placeholder="Which project made the promise?" /></label>}
      {kind !== 'promise' && <label>Promise<select value={lineage} onChange={event => setLineage(event.target.value)} required>
        <option value="">Choose the promise you are checking</option>
        {project?.promises.map(p => <option key={p.lineage} value={p.lineage}>{p.claim}</option>)}
      </select></label>}
      {kind === 'promise' ? <label>What did the project promise?<textarea name="claim" rows={3} required minLength={10} maxLength={2000} placeholder="Quote the original commitment. Keep its scope and any conditions." /></label>
        : promise && <blockquote className={styles.claim}>{promise.claim}</blockquote>}
      <label>{kind === 'promise' ? 'Original public source' : 'Evidence source'}<input name="source_url" type="url" required maxLength={2000} placeholder="https://…" /></label>
      <label>Source publication date <span className={styles.optional}>Optional; leave blank if unknown</span><input name="source_date" type="date" /></label>
      {kind === 'promise' && <label>Deadline as stated <span className={styles.optional}>Optional; do not infer a deadline</span><input name="deadline" maxLength={200} placeholder="For example: Q4 2026, or within six months of launch" /></label>}
      <label>{kind === 'promise' ? 'What would count as delivery?' : kind === 'challenge' ? 'What is wrong or missing in the assessment?' : 'What does this evidence show?'}
        <textarea name="detail" rows={4} required minLength={20} maxLength={4000} placeholder="Explain what a reviewer should check. Include the relevant section or timestamp and any limitations." />
      </label>
      <div className={styles.trap} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <p className={styles.muted}>Contributions are anonymous. Reviewed submissions may be published with their source and review note. Leave personal details out.</p>
      <button className={styles.primary} type="submit">{busy ? 'Sending…' : pending.current ? 'Retry this submission' : 'Send for review'}</button>
    </fieldset>
    <p role="status" aria-live="polite" className={styles.message}>{message}</p>
    {pending.current && !busy && <p className={styles.muted}>Receipt not confirmed. Retry sends your original submission so it cannot be saved twice.</p>}
  </form>;
}

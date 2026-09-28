'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/chrome-icons';
import type { PublicFeature } from '@/lib/feedback/data';
import styles from './support-feedback.module.css';

async function challenge(kind: 'request' | 'vote') {
  const response = await fetch(`/api/feedback/challenge?kind=${kind}`, { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw Error(data.error || 'Feedback is temporarily unavailable.');
  return data.token as string;
}
async function send(input: Record<string, unknown>) {
  const response = await fetch('/api/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) throw Error(data.error || 'Could not save that. Please try again.');
  return data;
}

export default function SupportFeedback({ requests, available }: { requests: PublicFeature[]; available: boolean }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const token = useRef('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [voteMessage, setVoteMessage] = useState('');
  const [voting, setVoting] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!available) return;
    let active = true;
    challenge('request').then(value => { if (active) token.current = value; })
      .catch(() => { if (active) setMessage('Could not open the form. Reload to try again.'); });
    return () => { active = false; };
  }, [available]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      if (!token.current) { token.current = await challenge('request'); throw Error('Please take a moment, then try again.'); }
      const fields = Object.fromEntries(new FormData(event.currentTarget));
      await send({ ...fields, kind: 'request', token: token.current });
      form.current?.reset();
      setMessage('Posted. Thanks for the idea!');
      router.refresh();
      token.current = '';
      // A failed refresh must not turn a successful submission into an error.
      void challenge('request').then(value => { token.current = value; }).catch(() => {});
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save that. Please try again.');
      // Keep the nonce for network failures: the database returns the original receipt.
      // Invalid/expired or rejected tokens need a fresh form challenge.
      if (error instanceof Error && /Reload|moment|already received/.test(error.message)) {
        token.current = '';
        void challenge('request').then(value => { token.current = value; }).catch(() => {});
      }
    } finally { setBusy(false); }
  }
  async function vote(id: string) {
    if (voting) return;
    setVoting(id); setVoteMessage('');
    try {
      const result = await send({ kind: 'vote', id, token: await challenge('vote') });
      setVotes(current => ({ ...current, [id]: result.upvotes }));
      setVoteMessage(result.outcome === 'already_voted' ? 'Your network has already voted for this idea.' : 'Vote added.');
    } catch (error) {
      setVoteMessage(error instanceof Error ? error.message : 'Could not save your vote. Please try again.');
    } finally { setVoting(null); }
  }
  return <div className={styles.columns}>
    <section className={styles.formPanel} aria-labelledby="share-idea">
      <h2 id="share-idea">Share an idea</h2>
      <p className={styles.note}>Comments are public and anonymous. Leave personal details out.</p>
      {!available && <p role="status">Feedback is temporarily unavailable. Please try again later.</p>}
      <form ref={form} onSubmit={submit}>
        <fieldset disabled={!available || busy} className={styles.fields}>
          <label>Idea<input name="title" required minLength={3} maxLength={120} /></label>
          <label>Details<textarea name="body" required minLength={10} maxLength={4000} rows={5} /></label>
          <label><span>Why it matters <span className={styles.note}>(optional)</span></span><textarea name="why" maxLength={1500} rows={2} /></label>
          <div className={styles.trap} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <button className={styles.post} type="submit">{busy ? 'Posting…' : 'Post idea'}</button>
        </fieldset>
        <p role="status" className={styles.message}>{message}</p>
      </form>
    </section>
    <section className={styles.board} aria-labelledby="ideas-heading">
      <h2 id="ideas-heading">Ideas</h2>
      <p className={styles.note}>Vote for the ideas you want to see built.</p>
      <p role="status" className={styles.message}>{voteMessage}</p>
      {available && requests.length === 0 && <p>No ideas here yet. Yours can be the first.</p>}
      {!available && <p>The ideas could not be loaded.</p>}
      <div className={styles.comments}>
        {requests.map(idea => <article className={styles.comment} key={idea.id}>
          <div className={styles.commentHeader}>
            <h3>{idea.title}</h3>
            <button type="button" className={styles.vote} disabled={!available || voting !== null || votes[idea.id] !== undefined}
              aria-label={`Vote for ${idea.title}`} aria-pressed={votes[idea.id] !== undefined} onClick={() => vote(idea.id)}>
              <Icon name="chevron-down" style={{ transform: 'rotate(180deg)' }} /> {voting === idea.id ? '…' : votes[idea.id] ?? idea.upvotes}
            </button>
          </div>
          <p>{idea.body}</p>
          {idea.why && <p className={styles.note}>{idea.why}</p>}
          {idea.status !== 'new' && <span className={styles.status}>{idea.status}</span>}
        </article>)}
      </div>
    </section>
  </div>;
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, Save, ArrowLeft, CalendarDays } from 'lucide-react';
import { adminFetch, slugify, formatDateTime, toDateTimeLocalInput } from '@/components/admin/adminFetch';
import {
  AdminPageHeader,
  LoadingState,
  ErrorState,
  Field,
  TextInput,
  TextArea,
  SelectInput,
  PrimaryButton,
  GhostButton,
  StatusBadge,
} from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import type { RegulationEvent, RegulationRow, RegulationStatus } from '@/components/admin/types';

const STATUSES: RegulationStatus[] = [
  'PROPOSED',
  'UNDER_DISCUSSION',
  'ANNOUNCED',
  'IMPLEMENTED',
  'ACTIVE',
  'SUPERSEDED',
  'REPEALED',
];

interface RegulationDetail extends RegulationRow {
  events?: RegulationEvent[];
}

const EMPTY_EVENT: RegulationEvent = {
  date: '',
  title: '',
  description: '',
  status: 'ANNOUNCED',
  sourceUrl: '',
};

export default function EditRegulationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { push } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<RegulationStatus>('PROPOSED');
  const [institution, setInstitution] = useState('');
  const [impactArea, setImpactArea] = useState('');
  const [events, setEvents] = useState<RegulationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<RegulationDetail>(`/api/admin/regulations/${params.id}`);
      setTitle(data.title);
      setSlug(data.slug);
      setDescription(data.description);
      setStatus(data.status);
      setInstitution(data.institution ?? '');
      setImpactArea(data.impactArea ?? '');
      setEvents(
        (data.events ?? []).map((e) => ({
          ...e,
          date: toDateTimeLocalInput(e.date) || e.date,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load the regulation.');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateEvent = (index: number, patch: Partial<RegulationEvent>) => {
    setEvents((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const removeEvent = (index: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const addEvent = () => {
    setEvents((prev) => [...prev, { ...EMPTY_EVENT }]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      push('Title is required.', 'error');
      return;
    }
    if (!description.trim()) {
      push('Description is required.', 'error');
      return;
    }
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (!e.title.trim() || !e.date) {
        push(`Event #${i + 1} needs a title and a date.`, 'error');
        return;
      }
    }
    setSaving(true);
    try {
      await adminFetch(`/api/admin/regulations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || slugify(title),
          description: description.trim(),
          status,
          institution: institution.trim() || undefined,
          impactArea: impactArea.trim() || undefined,
          events: events.map((e) => ({
            ...(e.id ? { id: e.id } : {}),
            date: new Date(e.date).toISOString(),
            title: e.title.trim(),
            description: e.description.trim(),
            status: e.status,
            sourceUrl: e.sourceUrl?.trim() || undefined,
          })),
        }),
      });
      push('Regulation updated.', 'success');
      router.push('/admin/regulations');
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading regulation…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div>
      <AdminPageHeader
        title="Edit regulation"
        description="Update details and the timeline of events."
        action={
          <GhostButton onClick={() => router.push('/admin/regulations')}>
            <ArrowLeft className="h-4 w-4" /> Back to list
          </GhostButton>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <Field label="Title">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug">
              <TextInput value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
            </Field>
            <Field label="Status">
              <SelectInput value={status} onChange={(e) => setStatus(e.target.value as RegulationStatus)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
          <Field label="Description">
            <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Institution">
              <TextInput value={institution} onChange={(e) => setInstitution(e.target.value)} />
            </Field>
            <Field label="Impact area">
              <TextInput value={impactArea} onChange={(e) => setImpactArea(e.target.value)} />
            </Field>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                <CalendarDays className="h-4 w-4 text-accent" /> Timeline events ({events.length})
              </h2>
              <button
                type="button"
                onClick={addEvent}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-accent hover:text-accent"
              >
                <Plus className="h-3.5 w-3.5" /> Add event
              </button>
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-muted">No events yet. Add milestones to build the timeline.</p>
            ) : (
              <div className="space-y-4">
                {events.map((e, i) => (
                  <div key={e.id ?? `new-${i}`} className="rounded-lg border border-border bg-bg p-3.5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted">Event #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeEvent(i)}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-zinc-800 hover:text-red-400"
                        aria-label={`Remove event ${i + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Field label="Title">
                        <TextInput value={e.title} onChange={(ev) => updateEvent(i, { title: ev.target.value })} />
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Date">
                          <TextInput
                            type="datetime-local"
                            value={e.date}
                            onChange={(ev) => updateEvent(i, { date: ev.target.value })}
                          />
                        </Field>
                        <Field label="Status">
                          <SelectInput
                            value={e.status}
                            onChange={(ev) => updateEvent(i, { status: ev.target.value as RegulationStatus })}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </SelectInput>
                        </Field>
                      </div>
                      <Field label="Description">
                        <TextArea
                          value={e.description}
                          onChange={(ev) => updateEvent(i, { description: ev.target.value })}
                        />
                      </Field>
                      <Field label="Source URL">
                        <TextInput
                          value={e.sourceUrl ?? ''}
                          onChange={(ev) => updateEvent(i, { sourceUrl: ev.target.value })}
                          placeholder="https://…"
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <PrimaryButton onClick={() => void handleSave()} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </PrimaryButton>
        </aside>
      </div>

      {events.length > 0 ? (
        <div className="mt-6 rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-bold text-zinc-100">Timeline preview</h2>
          <ol className="space-y-2">
            {events.map((e, i) => (
              <li key={e.id ?? `preview-${i}`} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted">{formatDateTime(e.date)}</span>
                <span className="font-medium text-zinc-200">{e.title || <em className="text-muted">Untitled</em>}</span>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

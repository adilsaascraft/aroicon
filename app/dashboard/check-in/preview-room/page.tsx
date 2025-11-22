'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  DoorOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Item = {
  _id: string;
  facultyName: string;
  email: string;
  mobile: string;
  topicName?: string;
  talkDate?: string;
  talkStartTime?: string;
  talkEndTime?: string;
  presentationSubmitStatus?: boolean;
  presentationSubmitTime?: string; // <-- NEW
};

const API = process.env.NEXT_PUBLIC_API_URL;

// ---- SECURED FETCHER ---- //
const fetcher = async (url: string) => {
  const token =
    typeof window !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((c) => c.startsWith('accessToken='))
          ?.split('=')[1]
      : '';

  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error('Failed to fetch');

  const json = await res.json();
  return json.data; // array only
};

export default function PreviewRoomPage() {
  const { data, isLoading } = useSWR(
    `${API}/api/checkin-details`,
    fetcher
  );

  const items: Item[] = data || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ---- SEARCH ---- //
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(items);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const words = q.split(/\s+/).filter(Boolean);

    const results = items.filter((m) => {
      const target = `
        ${m.facultyName || ''}
        ${m.email || ''}
        ${m.mobile || ''}
        ${m.topicName || ''}
      `
        .toLowerCase()
        .replace(/\s+/g, ' ');

      return words.every((w) => target.includes(w));
    });

    setFiltered(results);
  }, [searchQuery, items]);

  useEffect(() => setFiltered(items), [items]);

  // ---- OPEN CONFIRM ---- //
  const openConfirm = (item: Item) => {
    if (item.presentationSubmitStatus) return;
    setSelected(item);
    setShowConfirm(true);
  };

  // ---- CONFIRM SUBMIT ---- //
  const confirm = async () => {
    if (!selected) return;

    setSubmitting(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((c) => c.startsWith('accessToken='))
        ?.split('=')[1];

      const res = await fetch(
        `${API}/api/checkin-details/${selected._id}/presentation`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed');

      await mutate(`${API}/api/checkin-details`);

      setShowConfirm(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
    } catch (err) {
      alert((err as any).message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-blue-600"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <h1 className="text-2xl font-bold mt-3">
            Faculty Preview Room
          </h1>
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="relative max-w-md">
            <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Faculty"
              className="pl-10 w-full text-sm"
            />
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg p-4 animate-pulse h-40"
              />
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">
              {searchQuery
                ? 'No faculty members match your search'
                : 'No faculty members found'}
            </div>
          ) : (
            filtered.map((m) => {
              const checked = !!m.presentationSubmitStatus;

              const submitTime =
                checked && m.presentationSubmitTime
                  ? new Date(
                      m.presentationSubmitTime
                    ).toLocaleString()
                  : '-';

              return (
                <Card
                  key={m._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:scale-[1.02] transition-all"
                >
                  <CardContent>
                    {/* NAME */}
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                      {m.facultyName}
                    </h3>

                    {/* CONTACT */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${m.email}`}
                          className="underline"
                        >
                          {m.email}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a
                          href={`tel:${m.mobile}`}
                          className="underline"
                        >
                          {m.mobile}
                        </a>
                      </div>
                    </div>

                    {/* SESSION DETAILS */}
                    <div className="space-y-2 mb-4 p-3 bg-red-50 rounded-lg text-sm text-gray-700">
                      {m.topicName ? (
                        <>
                          <div className="flex items-center gap-2">
                            <strong>Topic Name:</strong> {m.topicName}
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-600" />
                            <strong>Talk Date:</strong> {m.talkDate}
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-600" />
                            <strong>Start:</strong> {m.talkStartTime}
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-600" />
                            <strong>End:</strong> {m.talkEndTime}
                          </div>

                          {/* NEW: SUBMIT TIME */}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-600" />
                            <strong>Submitted At:</strong> {submitTime}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-600">
                          No presentation details available
                        </div>
                      )}
                    </div>

                    {/* BUTTON */}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => openConfirm(m)}
                        disabled={checked || submitting}
                        className={`${
                          checked
                            ? 'bg-green-600 hover:bg-green-700 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white px-6`}
                      >
                        {checked ? 'Submitted' : 'Submit Presentation'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* CONFIRM DIALOG */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-red-600">
              Confirm Submission
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 text-center">
            <p className="text-gray-700 mb-2">
              Submit presentation for
            </p>

            <p className="text-lg font-semibold text-red-600 mb-1">
              {selected?.facultyName}
            </p>

            <p className="text-sm text-gray-600">
              {selected?.email} • {selected?.mobile}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              onClick={confirm}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed right-6 bottom-6 bg-white p-4 rounded-lg shadow">
          <div className="text-green-600 font-semibold">
            Submission Successful
          </div>
        </div>
      )}
    </div>
  );
}

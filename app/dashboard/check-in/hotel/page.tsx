'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Hotel as HotelIcon,
  Clock,
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
  hotelName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  hotelCheckInStatus?: boolean;
  hotelCheckInTime?: string; // <-- NEW FIELD FROM BACKEND
};

const API = process.env.NEXT_PUBLIC_API_URL;

// ---- Fetcher with Authorization ---- //
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
  return json.data; // return array only
};

export default function HotelPage() {
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

  // SEARCH
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(items);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const keywords = q.split(/\s+/).filter(Boolean);

    const results = items.filter((m) => {
      const target = `
        ${m.facultyName || ''}
        ${m.email || ''}
        ${m.mobile || ''}
        ${m.hotelName || ''}
      `
        .toLowerCase()
        .replace(/\s+/g, ' ');

      return keywords.every((kw) => target.includes(kw));
    });

    setFiltered(results);
  }, [searchQuery, items]);

  useEffect(() => setFiltered(items), [items]);

  const openConfirm = (it: Item) => {
    if (it.hotelCheckInStatus) return;
    setSelected(it);
    setShowConfirm(true);
  };

  const confirm = async () => {
    if (!selected) return;

    setSubmitting(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((c) => c.startsWith('accessToken='))
        ?.split('=')[1];

      const res = await fetch(
        `${API}/api/checkin-details/${selected._id}/hotel`,
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
          <h1 className="text-2xl font-bold mt-3">Faculty Hotel Check-In</h1>
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="relative max-w-md">
            <HotelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
              const checked = !!m.hotelCheckInStatus;

              const checkInTime =
                m.hotelCheckInStatus && m.hotelCheckInTime
                  ? new Date(m.hotelCheckInTime).toLocaleString()
                  : '-';

              return (
                <Card
                  key={m._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:scale-[1.02]"
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

                    {/* HOTEL INFO */}
                    <div className="space-y-2 mb-4 p-3 bg-yellow-50 rounded-lg text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-yellow-600" />
                        <strong>Hotel:</strong> {m.hotelName}
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-yellow-600" />
                        <strong>Check-In:</strong> {m.checkInDate}
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-yellow-600" />
                        <strong>Check-Out:</strong> {m.checkOutDate}
                      </div>

                      {/* NEW: CHECK-IN TIME */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <strong>Check-in Time:</strong> {checkInTime}
                      </div>
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
                        {checked ? 'Done' : 'Check-In'}
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
            <DialogTitle className="text-center text-yellow-600">
              Confirm Check-In
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 text-center">
            <p className="text-gray-700 mb-2">Check in</p>
            <p className="text-lg font-semibold text-yellow-600 mb-1">
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
            Check-In Successful
          </div>
        </div>
      )}
    </div>
  );
}

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
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/Pagination';

type Item = {
  _id: string;
  facultyName: string;
  email: string;
  mobile: string;
  arrivalDate?: string;
  arrivalTime?: string;
  arrivalFlightDetail?: string;
  arrivalCheckInStatus?: boolean;
  arrivalCheckInTime?: string;
  updatedAt?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL;

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Failed to fetch");

  const json = await res.json();
  return json.data || [];
};


export default function AirportArrivalPage() {
  const { data, isLoading } = useSWR(`${API}/api/checkin-details`, fetcher);
  const items: Item[] = data || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(items);
      setPage(1);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const keys = q.split(/\s+/).filter(Boolean);

    const results = items.filter((m) => {
      const target = `
        ${m.facultyName}
        ${m.email}
        ${m.mobile}
        ${m.arrivalFlightDetail}
      `
        .toLowerCase()
        .replace(/\s+/g, ' ');
      return keys.every((kw) => target.includes(kw));
    });

    setFiltered(results);
    setPage(1);
  }, [searchQuery, items]);

  useEffect(() => {
    setFiltered(items);
  }, [items]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const openConfirm = (item: Item) => {
    if (item.arrivalCheckInStatus) return;
    setSelected(item);
    setShowConfirm(true);
  };

  const confirm = async () => {
  if (!selected) return;
  setSubmitting(true);

  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const res = await fetch(
      `${API}/api/checkin-details/${selected._id}/arrival`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed");

    await mutate(`${API}/api/checkin-details`);
    setShowConfirm(false);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 1800);
  } catch (err: any) {
    alert(err.message || "Something went wrong");
  } finally {
    setSubmitting(false);
  }
};


  return (
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
  <div className="max-w-6xl mx-auto">

    {/* HEADER */}
    <div className="mb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mt-3">Faculty Airport Arrival</h1>
    </div>

    {/* SEARCH */}
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="relative max-w-md">
        <Plane className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search Faculty"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-sm"
        />
      </div>
    </div>

    {/* CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      {/* LOADING */}
      {isLoading &&
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse h-40" />
        ))}

      {/* EMPTY */}
      {!isLoading && paginated.length === 0 && (
        <div className="col-span-3 text-center py-8 text-gray-500">
          {searchQuery ? 'No results found' : 'No faculty found'}
        </div>
      )}

      {/* DATA */}
      {paginated.map((m) => {
        const checked = !!m.arrivalCheckInStatus;
        const displayTime = m.arrivalCheckInTime
          ? new Date(m.arrivalCheckInTime).toLocaleString()
          : '-';

        return (
          <Card
            key={m._id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition hover:scale-[1.02]"
          >
            <CardContent>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {m.facultyName}
              </h3>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${m.email}`} className="underline">{m.email}</a>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${m.mobile}`} className="underline">{m.mobile}</a>
                </div>
              </div>

              {/* ARRIVAL INFO */}
              <div className="space-y-2 mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <strong>Date:</strong> {m.arrivalDate}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <strong>Time:</strong> {m.arrivalTime}
                </div>

                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-600" />
                  <strong>Flight:</strong> {m.arrivalFlightDetail}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <strong>Check-In Time:</strong> {displayTime}
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex justify-end">
                <Button
                  disabled={checked || submitting}
                  onClick={() => openConfirm(m)}
                  className={`${checked
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                    } text-white px-6`}
                >
                  {checked ? 'Done' : 'Check-In'}
                </Button>
              </div>

            </CardContent>
          </Card>
        );
      })}
    </div>

    {/* PAGINATION */}
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  </div>

  {/* CONFIRMATION DIALOG */}
  <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-center text-blue-600">
          Confirm Check-In
        </DialogTitle>
      </DialogHeader>

      <div className="py-4 text-center">
        <p className="text-gray-700 mb-2">Check in</p>
        <p className="text-lg font-semibold text-blue-600">
          {selected?.facultyName}
        </p>
        <p className="text-sm text-gray-600">
          {selected?.email} • {selected?.mobile}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" disabled={submitting} onClick={() => setShowConfirm(false)}>
          Cancel
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={submitting} onClick={confirm}>
          {submitting ? 'Processing...' : 'Confirm'}
        </Button>
      </div>
    </DialogContent>
  </Dialog>

  {/* SUCCESS TOAST */}
  {showSuccess && (
    <div className="fixed right-6 bottom-6 bg-white p-4 rounded shadow">
      <p className="text-green-600 font-semibold">Check-In Successful</p>
    </div>
  )}
</div>
  );
}

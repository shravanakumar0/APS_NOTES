import { createClient } from '@supabase/supabase-js';
import type { SubjectNote } from '../data/apsData.ts';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://cvrqeeetzmavntapoggp.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_O3ajpMhS5xYF_tYPSPRGRg_cBxq3Qff';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Delete a note from Supabase (both dedicated 'notes' and sync table).
 */
export async function deleteNoteFromSupabase(noteId: string, code?: string): Promise<boolean> {
  try {
    await supabase.from('notes').delete().eq('id', noteId);
  } catch (_e) {}

  if (code) {
    try {
      const ticketPrefix = `NOTE-${code.toUpperCase()}`;
      await supabase.from('appointments').delete().ilike('ticket_number', `${ticketPrefix}%`);
    } catch (_e) {}
  }
  return true;
}

/**
 * Save a single note to Supabase.
 * Tries the dedicated 'notes' table first. If not found in schema cache,
 * saves to 'appointments' tagged with vehicle_type: 'VTU_NOTE' for seamless storage.
 */
export async function saveNoteToSupabase(note: SubjectNote): Promise<boolean> {
  // 1. Try public.notes table
  try {
    const { error: directError } = await supabase
      .from('notes')
      .upsert([
        {
          id: note.id,
          title: note.title,
          code: note.code,
          branch: note.branch,
          branches: note.branches || [note.branch],
          scheme: note.scheme,
          semester: note.semester,
          category: note.category,
          author: note.author,
          updated_date: note.updatedDate,
          read_time: note.readTime,
          views: note.views || 0,
          downloads: note.downloads || 0,
          rating: note.rating || 5.0,
          description: note.description,
          modules: note.modules || [],
          tags: note.tags || [],
          is_community_uploaded: Boolean(note.isCommunityUploaded),
          uploaded_by: note.uploadedBy || null,
          college: note.college || null,
          pdf_data_url: note.pdfDataUrl || null,
          pdf_file_name: note.pdfFileName || null,
          file_size: note.fileSize || null,
        },
      ]);

    if (!directError) {
      return true;
    }
  } catch (_ignored) {
    // Falls through to sync table
  }

  // 2. Resilient live sync via appointments table with vehicle_type = 'VTU_NOTE'
  const ticket_number = `NOTE-${note.code.toUpperCase()}-${note.id.slice(-6)}`;
  const { error: syncError } = await supabase
    .from('appointments')
    .upsert(
      [
        {
          ticket_number,
          name: `${note.title} (${note.code})`,
          phone: note.code,
          vehicle_type: 'VTU_NOTE',
          requirement: `${note.branch} | ${note.scheme} Scheme | Sem ${note.semester}`,
          message: JSON.stringify(note),
          status: 'published',
        },
      ],
      { onConflict: 'ticket_number' }
    );

  if (syncError) {
    // Try simple insert if upsert without constraint failed
    const { error: insertErr } = await supabase.from('appointments').insert([
      {
        ticket_number,
        name: `${note.title} (${note.code})`,
        phone: note.code,
        vehicle_type: 'VTU_NOTE',
        requirement: `${note.branch} | ${note.scheme} Scheme | Sem ${note.semester}`,
        message: JSON.stringify(note),
        status: 'published',
      },
    ]);
    if (insertErr) throw insertErr;
  }

  return true;
}

/**
 * Fetch all notes stored in Supabase.
 * Checks both 'notes' table and 'appointments' tagged with 'VTU_NOTE'.
 */
export async function fetchNotesFromSupabase(): Promise<SubjectNote[]> {
  const notesList: SubjectNote[] = [];

  // 1. Try public.notes table
  try {
    const { data: dedicatedNotes, error: dedicatedErr } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!dedicatedErr && dedicatedNotes && dedicatedNotes.length > 0) {
      for (const row of dedicatedNotes) {
        notesList.push({
          id: row.id,
          title: row.title,
          code: row.code,
          branch: row.branch,
          branches: row.branches || [row.branch],
          scheme: row.scheme,
          semester: row.semester,
          category: row.category,
          author: row.author,
          updatedDate: row.updated_date || row.created_at,
          readTime: row.read_time || '5 min read',
          views: row.views || 0,
          downloads: row.downloads || 0,
          rating: Number(row.rating) || 5.0,
          description: row.description || '',
          modules: row.modules || [],
          tags: row.tags || [],
          isCommunityUploaded: row.is_community_uploaded,
          uploadedBy: row.uploaded_by,
          college: row.college,
          pdfDataUrl: row.pdf_data_url,
          pdfFileName: row.pdf_file_name,
          fileSize: row.file_size,
        });
      }
      return notesList;
    }
  } catch (_ignored) {}

  // 2. Fetch from appointments table where vehicle_type = 'VTU_NOTE'
  try {
    const { data: syncRows, error: syncErr } = await supabase
      .from('appointments')
      .select('*')
      .eq('vehicle_type', 'VTU_NOTE')
      .order('created_at', { ascending: false });

    if (!syncErr && syncRows) {
      for (const row of syncRows) {
        if (row.message) {
          try {
            const parsed = JSON.parse(row.message);
            if (parsed && parsed.id && parsed.code) {
              notesList.push(parsed);
            }
          } catch (_parseErr) {}
        }
      }
    }
  } catch (_err) {}

  return notesList;
}

/**
 * Sync an array of notes into Supabase.
 */
export async function syncAllNotesToSupabase(notes: SubjectNote[]): Promise<{ count: number; total: number }> {
  let count = 0;
  for (const n of notes) {
    try {
      await saveNoteToSupabase(n);
      count++;
    } catch (e) {
      console.warn(`Failed to sync note ${n.code} to Supabase:`, e);
    }
  }
  return { count, total: notes.length };
}


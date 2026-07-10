"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getUsers() {
  try {
    // 1. Fetch profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // 2. Fetch users from auth.users via Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) throw authError;

    // 3. Merge profiles with their respective emails
    const mergedUsers = ((profiles || []) as any[]).map(profile => {
      const authUser = ((authData as any)?.users || []).find((u: any) => u.id === profile.id);
      return {
        ...profile,
        email: authUser?.email || 'Sem e-mail',
      };
    });

    return { success: true, data: mergedUsers };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message };
  }
}

export async function changeUserRole(userId: string, newRole: 'admin' | 'editor') {
  try {
    if (!['admin', 'editor'].includes(newRole)) {
      throw new Error('Cargo inválido. Use apenas admin ou editor.');
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error changing user role:', error);
    return { success: false, error: error.message };
  }
}

export async function createUser(email: string, name: string, password: string, role: 'admin' | 'editor') {
  try {
    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email so they can login immediately
    });

    if (authError) throw authError;

    const newUserId = authData.user.id;

    // 2. The profile might be created automatically by a database trigger if you have one.
    // However, since we need to set the specific role and name, we'll try to upsert/update it.
    
    // Let's check if the profile exists first (in case of a trigger)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', newUserId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ role, name })
        .eq('id', newUserId);
        
      if (updateError) throw updateError;
    } else {
      // Insert new profile
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([{ id: newUserId, role, name }]);

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

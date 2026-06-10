import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey);
}

function validateBody(body: any): boolean {
  return (
    typeof body.email === "string" &&
    typeof body.password === "string" &&
    typeof body.name === "string"
  );
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // A. Verify Authorization Header and JWT
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized. Missing token." },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];

    // Verify token using a public client (does not require service role)
    const supabasePublic = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user }, error: publicAuthError } = await supabasePublic.auth.getUser(token);
    if (publicAuthError || !user) {
      return NextResponse.json(
        { message: "Unauthorized. Invalid token." },
        { status: 401 }
      );
    }

    // First, try to read the role from the users table (DB‑backed)
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // Determine whether the caller is an admin
    const isAdminFromDb = dbUser && dbUser.role === "admin" && !dbError;

    // Fallback: check the JWT's app_metadata for a role claim (e.g., set via Supabase auth hooks)
    const jwtRole = (user?.app_metadata as any)?.role;
    const isAdminFromJwt = jwtRole === "admin";

    if (!isAdminFromDb && !isAdminFromJwt) {
      return NextResponse.json(
        { message: "Forbidden. Admin role required." },
        { status: 403 }
      );
    }

    // C. Validate Request Body
    const body = await request.json();
    if (!validateBody(body)) {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }
    const { email, password, name } = body;

    // 1️⃣ Create auth user (service‑role bypasses RLS)
    const { data: authData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createUserError) {
      throw createUserError;
    }

    const newUserId = authData?.user?.id;
    if (!newUserId) {
      throw new Error("User creation succeeded but returned no user ID.");
    }

    // 2️⃣ Insert profile row with verifier role
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: newUserId,
        email,
        name,
        role: "verifier",
      });

    if (insertError) {
      // Roll back auth user if DB insert fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw insertError;
    }


    return NextResponse.json(
      { message: "Verifier created successfully." },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Create verifier error:", err);
    const status = typeof err?.status === "number" ? err.status : 500;
    const message = err?.message ?? "Internal server error.";
    return NextResponse.json({ message }, { status });
  }
}

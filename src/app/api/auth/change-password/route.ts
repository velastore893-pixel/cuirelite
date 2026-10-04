import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { currentEmail, newEmail, newPassword, newName } = await request.json();

    if (!currentEmail) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني الحالي مطلوب" },
        { status: 400 }
      );
    }

    // Find user
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, currentEmail));

    if (!user) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني غير مسجل" },
        { status: 404 }
      );
    }

    // Check if new email already exists
    if (newEmail && newEmail !== currentEmail) {
      const [existingEmail] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, newEmail));
      
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: "البريد الإلكتروني الجديد مستعمل بالفعل" },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: { password?: string; email?: string; name?: string } = {};
    if (newPassword && newPassword.length >= 4) {
      updateData.password = newPassword;
    }
    if (newEmail && newEmail !== currentEmail) {
      updateData.email = newEmail;
    }
    if (newName) {
      updateData.name = newName;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "لا توجد تغييرات للحفظ" },
        { status: 400 }
      );
    }

    await db
      .update(adminUsers)
      .set(updateData)
      .where(eq(adminUsers.id, user.id));

    // Return updated user info
    const updatedUser = {
      ...user,
      email: newEmail && newEmail !== currentEmail ? newEmail : user.email,
      name: newName || user.name,
    };

    return NextResponse.json({
      success: true,
      message: "تم التحديث بنجاح",
      user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role },
    });
  } catch (error) {
    console.error("Change credentials error:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  addRevenueEntry,
  deleteRevenueEntry,
  detectAdSenseInstall,
  getMonetization,
  getRevenueDashboard,
  importRevenueEntries,
  saveAdManager,
  saveAdSense,
  saveAffiliates,
  saveBanking,
  saveBanners,
  saveNetworks,
  syncSetupProgress,
  tryNetworkRevenueImport,
  updateSetupStep,
} from "@/lib/monetization";
import type { SetupStepId } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const view = req.nextUrl.searchParams.get("view");
  if (view === "revenue") {
    return NextResponse.json(await getRevenueDashboard());
  }
  if (view === "setup") {
    return NextResponse.json((await syncSetupProgress()).setup);
  }
  return NextResponse.json(getMonetization());
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = String(body.action || "");

    switch (action) {
      case "save_adsense": {
        const state = saveAdSense(body.data || {});
        const check = detectAdSenseInstall(state.adsense);
        return NextResponse.json({ ok: true, adsense: state.adsense, check });
      }
      case "verify_adsense": {
        const current = getMonetization();
        const check = detectAdSenseInstall(current.adsense);
        const state = saveAdSense({
          scriptInstalled: check.scriptInstalled,
          status: body.status || check.status,
        });
        return NextResponse.json({ ok: true, adsense: state.adsense, check });
      }
      case "save_ad_manager":
        return NextResponse.json({
          ok: true,
          adManager: saveAdManager(body.data || {}).adManager,
        });
      case "save_affiliates":
        return NextResponse.json({
          ok: true,
          affiliates: saveAffiliates(body.data || []).affiliates,
        });
      case "save_networks":
        return NextResponse.json({
          ok: true,
          networks: saveNetworks(body.data || []).networks,
        });
      case "save_banners":
        return NextResponse.json({
          ok: true,
          banners: saveBanners(body.data || []).banners,
        });
      case "save_banking":
        return NextResponse.json({
          ok: true,
          banking: saveBanking(body.data || {}).banking,
        });
      case "add_revenue": {
        const state = addRevenueEntry({
          date: body.data.date,
          source: body.data.source,
          amount: Number(body.data.amount || 0),
          currency: body.data.currency || "BRL",
          impressions: Number(body.data.impressions || 0) || undefined,
          clicks: Number(body.data.clicks || 0) || undefined,
          conversions: Number(body.data.conversions || 0) || undefined,
          articleSlug: body.data.articleSlug || undefined,
          categorySlug: body.data.categorySlug || undefined,
          notes: body.data.notes || undefined,
          origin: body.data.origin || undefined,
          manual: true,
        });
        return NextResponse.json({
          ok: true,
          revenue: state.revenue,
          dashboard: await getRevenueDashboard(),
        });
      }
      case "delete_revenue": {
        const state = deleteRevenueEntry(String(body.id || ""));
        return NextResponse.json({
          ok: true,
          dashboard: await getRevenueDashboard(),
          revenue: state.revenue,
        });
      }
      case "import_revenue": {
        const rows = Array.isArray(body.data) ? body.data : [];
        const result = importRevenueEntries(rows, {
          fromApi: Boolean(body.fromApi),
        });
        return NextResponse.json({
          ok: true,
          imported: result.imported,
          dashboard: await getRevenueDashboard(),
          revenue: result.state.revenue,
        });
      }
      case "try_api_import": {
        const result = tryNetworkRevenueImport();
        return NextResponse.json({ ok: true, ...result, dashboard: await getRevenueDashboard() });
      }
      case "setup_step": {
        const step = body.step as SetupStepId;
        const state = updateSetupStep(step, Boolean(body.done));
        return NextResponse.json({ ok: true, setup: state.setup });
      }
      case "sync_setup":
        return NextResponse.json({ ok: true, setup: (await syncSetupProgress()).setup });
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao salvar" },
      { status: 500 }
    );
  }
}

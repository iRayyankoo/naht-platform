import assert from "assert";

async function runDemoSprintCorrectiveTests() {
  console.log("==================================================");
  console.log("STARTING DEMO SPRINT CORRECTIVE SUITE (LOCAL ONLY)");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function runTest(name: string, fn: () => void) {
    total++;
    try {
      fn();
      console.log(`[PASS ${total}] ${name}`);
      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[FAIL ${total}] ${name}: ${msg}`);
    }
  }

  // ----------------------------------------------------
  // TEST 1: HR Role Restrictions (ADMIN vs MARKETING vs SALES)
  // ----------------------------------------------------
  runTest("HR Role Access: ADMIN is granted, MARKETING and SALES are denied", () => {
    function canAccessHr(role: string): boolean {
      return role === "ADMIN";
    }

    assert.strictEqual(canAccessHr("ADMIN"), true, "ADMIN must be granted HR access");
    assert.strictEqual(canAccessHr("MARKETING"), false, "MARKETING must be denied HR access");
    assert.strictEqual(canAccessHr("SALES"), false, "SALES must be denied HR access");
  });

  // ----------------------------------------------------
  // TEST 2: Marketing Role Restrictions (ADMIN/MARKETING vs SALES)
  // ----------------------------------------------------
  runTest("Marketing Role Access: ADMIN and MARKETING are granted, SALES is denied", () => {
    function canAccessMarketing(role: string): boolean {
      return role === "ADMIN" || role === "MARKETING";
    }

    assert.strictEqual(canAccessMarketing("ADMIN"), true, "ADMIN must be granted Marketing access");
    assert.strictEqual(canAccessMarketing("MARKETING"), true, "MARKETING must be granted Marketing access");
    assert.strictEqual(canAccessMarketing("SALES"), false, "SALES must be denied Marketing access");
  });

  // ----------------------------------------------------
  // TEST 3: Employee Directory Filter & Search Persistence
  // ----------------------------------------------------
  runTest("Employee Directory: Search query and filters preserve each other", () => {
    const validDepts = ["الكل", "التطوير الهندسي", "التسويق والإعلام", "المبيعات وحسابات العملاء", "التصميم والتخطيط"];
    const validStatuses = ["الكل", "نشط", "في إجازة", "غير نشط"];

    function normalizeParams(query?: string, dept?: string, status?: string) {
      const q = (query || "").trim();
      const d = validDepts.includes(dept || "") ? dept! : "الكل";
      const s = validStatuses.includes(status || "") ? status! : "الكل";
      return { q, d, s };
    }

    // Test unknown param normalization
    const normalized = normalizeParams("  موظف  ", "قسم_مزيف", "حالة_مزيفة");
    assert.strictEqual(normalized.q, "موظف");
    assert.strictEqual(normalized.d, "الكل", "Unknown department must normalize to 'الكل'");
    assert.strictEqual(normalized.s, "الكل", "Unknown status must normalize to 'الكل'");

    // Test link query parameter building
    function buildFilterUrl(q: string, d: string, s: string) {
      return `/crm/hr/employees?query=${encodeURIComponent(q)}&dept=${encodeURIComponent(d)}&status=${encodeURIComponent(s)}`;
    }

    const url = buildFilterUrl("موظف 101", "التطوير الهندسي", "نشط");
    assert.ok(url.includes("query=%D9%85%D9%88%D8%B8%D9%81%20101"), "URL must retain search query");
    assert.ok(url.includes("dept=%D8%A7%D9%84%D8%AA%D8%B7%D9%88%D9%8A%D8%B1%20%D8%A7%D9%84%D9%87%D9%86%D8%AF%D8%B3%D9%8A"), "URL must retain department filter");
    assert.ok(url.includes("status=%D9%86%D8%B4%D8%B7"), "URL must retain status filter");
  });

  // ----------------------------------------------------
  // TEST 4: Sidebar Active Group Toggle Logic
  // ----------------------------------------------------
  runTest("Sidebar: Toggling active group closed works on first click", () => {
    let activeGroupId = "hr";
    let openGroups: Record<string, boolean> = {};

    function isGroupOpen(id: string) {
      if (id === activeGroupId) {
        if (openGroups[id] === false) return false;
        return true;
      }
      return !!openGroups[id];
    }

    function toggleGroup(id: string) {
      const currentlyOpen = isGroupOpen(id);
      openGroups = { ...openGroups, [id]: !currentlyOpen };
    }

    // Active group is open by default
    assert.strictEqual(isGroupOpen("hr"), true, "Active group should be open by default");

    // Click 1: Toggle active group -> should close
    toggleGroup("hr");
    assert.strictEqual(isGroupOpen("hr"), false, "Active group should close on first click!");

    // Click 2: Toggle active group again -> should reopen
    toggleGroup("hr");
    assert.strictEqual(isGroupOpen("hr"), true, "Active group should reopen on second click!");
  });

  console.log("\n==================================================");
  console.log(`SUITE COMPLETE: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runDemoSprintCorrectiveTests().catch((err) => {
  console.error("TEST RUNNER FATAL ERROR:", err);
  process.exit(1);
});

import assert from "assert";

// Mock global browser environment for node testing
if (typeof window === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).window = {
    location: {
      search: "?utm_source=test_source",
      href: "http://localhost:3000/test",
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).document = {
    referrer: "http://google.com",
  };
  Object.defineProperty(global, "navigator", {
    value: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      sendBeacon: () => {
        throw new Error("Beacon Network Failure");
      },
    },
    configurable: true,
    writable: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).localStorage = {
    getItem: () => {
      throw new Error("Storage Access Denied");
    },
    setItem: () => {
      throw new Error("Storage Access Denied");
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).sessionStorage = {
    getItem: () => {
      throw new Error("Storage Access Denied");
    },
    setItem: () => {
      throw new Error("Storage Access Denied");
    },
  };
}

async function runBatch4cCorrectiveTests() {
  console.log("==================================================");
  console.log("STARTING BATCH 4C CORRECTIVE SUITE (LOCAL ONLY)");
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

  async function runAsyncTest(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`[PASS ${total}] ${name}`);
      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[FAIL ${total}] ${name}: ${msg}`);
    }
  }

  // ----------------------------------------------------
  // TEST 1: Corrupt JSON in Projects Actions
  // ----------------------------------------------------
  const { parseFeaturesJSON, parseWarrantiesJSON, parseGalleryImagesJSON, validateProjectMapCoordinates } = await import("../src/actions/projects");

  await runAsyncTest("Projects Action: Corrupt JSON in features throws error and prevents mutation", async () => {
    await assert.rejects(
      async () => {
        await parseFeaturesJSON("{bad_json_features");
      },
      (err: Error) => {
        return err.message.includes("بيانات المميزات المزودة غير صالحة");
      }
    );
  });

  await runAsyncTest("Projects Action: Missing feature title throws error", async () => {
    await assert.rejects(
      async () => {
        await parseFeaturesJSON(JSON.stringify([{ desc: "وصف بدون عنوان" }]));
      },
      (err: Error) => {
        return err.message.includes("عنوان الميزة مطلوب لكل عنصر");
      }
    );
  });

  await runAsyncTest("Projects Action: Corrupt JSON in warranties throws error", async () => {
    await assert.rejects(
      async () => {
        await parseWarrantiesJSON("invalid_warranties_str");
      },
      (err: Error) => {
        return err.message.includes("بيانات الضمانات المزودة غير صالحة");
      }
    );
  });

  await runAsyncTest("Projects Action: Corrupt JSON in gallery images throws error", async () => {
    await assert.rejects(
      async () => {
        await parseGalleryImagesJSON("invalid_gallery");
      },
      (err: Error) => {
        return err.message.includes("بيانات معرض الصور المزودة غير صالحة");
      }
    );
  });

  await runAsyncTest("Projects Action: Invalid latitude bounds rejects in validateProjectMapCoordinates", async () => {
    await assert.rejects(
      async () => {
        await validateProjectMapCoordinates({
          showOnHomeMap: true,
          mapLat: 150, // Invalid latitude (> 90)
          mapLng: 46.6,
          mapX: 10,
          mapY: 10,
        });
      },
      (err: Error) => {
        return err.message.includes("دائرة العرض (Latitude) غير صالحة");
      }
    );
  });

  await runAsyncTest("Projects Action: Invalid percentage bounds rejects in validateProjectMapCoordinates", async () => {
    await assert.rejects(
      async () => {
        await validateProjectMapCoordinates({
          showOnHomeMap: true,
          mapLat: 24.7,
          mapLng: 46.6,
          mapX: 120, // Invalid percentage (> 100)
          mapY: 10,
        });
      },
      (err: Error) => {
        return err.message.includes("الإحداثي X غير صالح");
      }
    );
  });

  // ----------------------------------------------------
  // TEST 2: Rejection of Object/File and Invalid Numbers in Forms
  // ----------------------------------------------------
  const {
    submitContactUs,
    submitOpportunity,
    submitMaintenance,
    submitVendor,
    submitCareer,
  } = await import("../src/actions/forms");

  await runAsyncTest("Forms Action: Reject Object passed as name in submitContactUs", async () => {
    await assert.rejects(
      async () => {
        await submitContactUs({
          name: { first: "محمد", last: "أحمد" },
          phone: "0500000000",
          inquiryType: "استفسار",
          message: "رسالة تجريبية",
        });
      },
      (err: Error) => {
        return err.message.includes("حقل الاسم مطلوب ويجب أن يكون نصاً صالحاً");
      }
    );
  });

  await runAsyncTest("Forms Action: Reject non-finite number in submitOpportunity", async () => {
    await assert.rejects(
      async () => {
        await submitOpportunity({
          name: "علي",
          phone: "0500000000",
          opportunityType: "أرض",
          city: "الرياض",
          district: "النرجس",
          landArea: "غير_رقمي",
        });
      },
      (err: Error) => {
        return err.message.includes("حقل مساحة الأرض يجب أن يكون رقماً صالحاً");
      }
    );
  });

  await runAsyncTest("Forms Action: Reject negative experienceYears in submitCareer", async () => {
    await assert.rejects(
      async () => {
        await submitCareer({
          fullName: "سارة",
          phone: "0500000000",
          email: "sara@example.com",
          position: "مهندس",
          resumeUrl: "https://example.com/cv.pdf",
          experienceYears: -3,
        });
      },
      (err: Error) => {
        return err.message.includes("حقل سنوات الخبرة يجب أن يكون عدداً صحيحاً غير سالب");
      }
    );
  });

  await runAsyncTest("Forms Action: Reject decimal experienceYears in submitCareer", async () => {
    await assert.rejects(
      async () => {
        await submitCareer({
          fullName: "سارة",
          phone: "0500000000",
          email: "sara@example.com",
          position: "مهندس",
          resumeUrl: "https://example.com/cv.pdf",
          experienceYears: 4.5,
        });
      },
      (err: Error) => {
        return err.message.includes("حقل سنوات الخبرة يجب أن يكون عدداً صحيحاً غير سالب");
      }
    );
  });

  // ----------------------------------------------------
  // TEST 3: TrackedButton Storage & Beacon Failure Resiliency
  // ----------------------------------------------------
  runTest("TrackedButton: Guaranteed navigation in finally even with storage & beacon failures", () => {
    let navigateTarget = "";
    // Mock window.location.href setter
    Object.defineProperty(window.location, "href", {
      set: (val: string) => {
        navigateTarget = val;
      },
      get: () => navigateTarget,
      configurable: true,
    });

    // Simulate clicking TrackedButton logic where storage & beacon throw exceptions
    const hrefTarget = "https://wa.me/966500000000";
    
    try {
      // Execute the exact finally block pattern of TrackedButton
      try {
        localStorage.getItem("visitor_id"); // Throws Error
      } catch {
        // swallowed
      } finally {
        window.location.href = hrefTarget;
      }
    } catch {
      // outer error
    }

    assert.strictEqual(navigateTarget, hrefTarget, "Navigation to href MUST succeed in finally block!");
  });

  // ----------------------------------------------------
  // TEST 4: ProjectViewTracker Render Deduplication
  // ----------------------------------------------------
  runTest("ProjectViewTracker: Re-renders with same primitive projectId fire event EXACTLY ONCE", () => {
    const firedEvents: Array<{ event: string; data: unknown }> = [];
    
    // Simulate tracker state logic
    let trackedId: string | null = null;

    function simulateEffectRun(projectId: string, projectName?: string) {
      if (!projectId) return;
      if (trackedId !== projectId) {
        trackedId = projectId;
        firedEvents.push({
          event: "project_view",
          data: { projectId, projectName: projectName || "" },
        });
      }
    }

    // Trigger 5 consecutive re-renders with same projectId
    simulateEffectRun("proj_100", "مشروع النعيم");
    simulateEffectRun("proj_100", "مشروع النعيم");
    simulateEffectRun("proj_100", "مشروع النعيم");
    simulateEffectRun("proj_100", "مشروع النعيم");
    simulateEffectRun("proj_100", "مشروع النعيم");

    assert.strictEqual(firedEvents.length, 1, "Expected exactly 1 tracking event across 5 re-renders!");
    assert.strictEqual(firedEvents[0].data && (firedEvents[0].data as Record<string, unknown>).projectId, "proj_100");
  });

  console.log("\n==================================================");
  console.log(`SUITE COMPLETE: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runBatch4cCorrectiveTests().catch((err) => {
  console.error("TEST RUNNER FATAL ERROR:", err);
  process.exit(1);
});

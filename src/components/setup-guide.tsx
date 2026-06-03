"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertTriangle, ExternalLink } from "lucide-react";

interface TabletWallpaperUrls {
  portrait: string;
  landscape: string;
}

interface SetupGuideProps {
  apiUrl: string;
  tabletWallpaperUrls: TabletWallpaperUrls | null;
}

function StepBadge({ number }: { number: number }): React.ReactElement {
  return (
    <span className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
      {number}
    </span>
  );
}

function CopyUrlButton({ url }: { url: string }): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const canCopy = url.length > 0;

  const handleCopy = async () => {
    if (!canCopy) {
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 flex items-center gap-2">
      <code className="bg-muted/50 text-foreground min-w-0 flex-1 rounded-lg px-3 py-2 font-mono text-xs break-all">
        {canCopy ? url : "Preparing absolute URL..."}
      </code>
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopy}
        aria-label="Copy wallpaper URL"
        disabled={!canCopy}
        className="shrink-0"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

function ImportantBox({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="my-3 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <div className="text-foreground/80 text-sm">{children}</div>
    </div>
  );
}

export function SetupGuide({ apiUrl, tabletWallpaperUrls }: SetupGuideProps): React.ReactElement {
  const tabletUrls =
    tabletWallpaperUrls?.portrait && tabletWallpaperUrls.landscape ? tabletWallpaperUrls : null;

  return (
    <div className="glass overflow-hidden rounded-2xl p-5 sm:p-6">
      <p className="section-label mb-5">Setup Guide</p>

      <Tabs defaultValue="iphone">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="iphone">Apple</TabsTrigger>
          <TabsTrigger value="android">Android</TabsTrigger>
        </TabsList>

        <TabsContent value="iphone" className="mt-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <StepBadge number={1} />
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground font-semibold">Your Configuration</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Your personalized wallpaper URL:
                </p>
                <CopyUrlButton url={apiUrl} />
              </div>
            </div>
          </div>

          {tabletUrls ? (
            <>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <StepBadge number={2} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground font-semibold">iPad Orientation URLs</h3>
                    <div className="text-muted-foreground mt-2 space-y-3 text-sm">
                      <p>
                        Use these two URLs in one shortcut so iPadOS chooses the matching wallpaper
                        whenever the shortcut runs.
                      </p>
                      <div>
                        <p className="text-foreground font-medium">Portrait</p>
                        <CopyUrlButton url={tabletUrls.portrait} />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">Landscape</p>
                        <CopyUrlButton url={tabletUrls.landscape} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <StepBadge number={3} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground font-semibold">Create Rotating Shortcut</h3>
                    <div className="text-muted-foreground mt-2 space-y-3 text-sm">
                      <Button asChild variant="outline" size="sm" className="mb-1">
                        <a href="shortcuts://create-shortcut">
                          <ExternalLink className="h-4 w-4" />
                          Open Shortcuts
                        </a>
                      </Button>
                      <ol className="list-inside list-decimal space-y-1">
                        <li>
                          Add <strong>&quot;Get Orientation&quot;</strong>.
                        </li>
                        <li>
                          Add <strong>&quot;If&quot;</strong> and set it to check whether
                          orientation contains <strong>&quot;Landscape&quot;</strong>.
                        </li>
                        <li>
                          In the <strong>If</strong> branch, add <strong>&quot;Text&quot;</strong>{" "}
                          and paste the landscape URL.
                        </li>
                        <li>
                          In <strong>Otherwise</strong>, add <strong>&quot;Text&quot;</strong> and
                          paste the portrait URL.
                        </li>
                        <li>
                          Add <strong>&quot;Get Contents of URL&quot;</strong> after{" "}
                          <strong>End If</strong>.
                        </li>
                        <li>
                          Add <strong>&quot;Set Wallpaper Photo&quot;</strong> and choose{" "}
                          <strong>&quot;Lock Screen&quot;</strong>.
                        </li>
                      </ol>
                      <ImportantBox>
                        In <strong>&quot;Set Wallpaper Photo&quot;</strong>, tap the arrow to show
                        options &rarr; disable both <strong>&quot;Crop to Subject&quot;</strong> and{" "}
                        <strong>&quot;Show Preview&quot;</strong>. This prevents iPadOS from
                        cropping and asking for confirmation each time.
                      </ImportantBox>
                      <ImportantBox>
                        iPadOS can read orientation inside a shortcut, but Shortcuts does not offer
                        a native trigger for every physical rotation. Run this shortcut manually,
                        with Siri, from Control Center, or from a daily/app automation.
                      </ImportantBox>
                      <ImportantBox>
                        A fully preconfigured one-click shortcut requires Apple&apos;s signed
                        Shortcuts sharing flow. This page can open the editor and provide exact
                        URLs, but it should not generate an unsigned shortcut file and present it as
                        a reliable install.
                      </ImportantBox>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <StepBadge number={4} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground font-semibold">Optional Automation</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Open <strong>Shortcuts</strong> &rarr; <strong>Automation</strong> &rarr;{" "}
                      <strong>New Automation</strong> &rarr; choose <strong>Time of Day</strong> or{" "}
                      <strong>App</strong> &rarr; select{" "}
                      <strong>&quot;Run Immediately&quot;</strong> &rarr; add{" "}
                      <strong>&quot;Run Shortcut&quot;</strong> and select this shortcut.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <StepBadge number={2} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground font-semibold">Create Automation</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Open <strong>Shortcuts</strong> app &rarr; Go to <strong>Automation</strong>{" "}
                      tab &rarr; <strong>New Automation</strong> &rarr; <strong>Time of Day</strong>{" "}
                      &rarr; <strong>6:00 AM</strong> &rarr; Repeat{" "}
                      <strong>&quot;Daily&quot;</strong> &rarr; Select{" "}
                      <strong>&quot;Run Immediately&quot;</strong> &rarr;{" "}
                      <strong>&quot;Create New Shortcut&quot;</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <StepBadge number={3} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground font-semibold">Create Shortcut</h3>
                    <div className="text-muted-foreground mt-2 space-y-3 text-sm">
                      <p>
                        <strong>3.1:</strong> Add <strong>&quot;Get Contents of URL&quot;</strong>{" "}
                        action &rarr; paste the following URL there:
                      </p>
                      <CopyUrlButton url={apiUrl} />
                      <p>
                        <strong>3.2:</strong> Add <strong>&quot;Set Wallpaper Photo&quot;</strong>{" "}
                        action &rarr; choose <strong>&quot;Lock Screen&quot;</strong>
                      </p>
                      <ImportantBox>
                        In <strong>&quot;Set Wallpaper Photo&quot;</strong>, tap the arrow to show
                        options &rarr; disable both <strong>&quot;Crop to Subject&quot;</strong> and{" "}
                        <strong>&quot;Show Preview&quot;</strong>. This prevents iOS from cropping
                        and asking for confirmation each time.
                      </ImportantBox>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="android" className="mt-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <StepBadge number={1} />
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground font-semibold">Your Configuration</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Your personalized wallpaper URL:
                </p>
                <CopyUrlButton url={apiUrl} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <StepBadge number={2} />
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground font-semibold">Prerequisites</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Install{" "}
                  <a
                    href="https://play.google.com/store/apps/details?id=com.arlosoft.macrodroid"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium underline"
                  >
                    MacroDroid
                  </a>{" "}
                  from Google Play Store.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <StepBadge number={3} />
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground font-semibold">Setup Macro</h3>
                <div className="text-muted-foreground mt-2 space-y-2 text-sm">
                  <p>
                    Open <strong>MacroDroid</strong> &rarr; <strong>Add Macro</strong>
                  </p>
                  <p>
                    <strong>Trigger:</strong> Date/Time &rarr; Day/Time &rarr; Set time to{" "}
                    <strong>00:01:00</strong> &rarr; Activate all weekdays
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <StepBadge number={4} />
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground font-semibold">Configure Actions</h3>
                <div className="text-muted-foreground mt-2 space-y-4 text-sm">
                  <div>
                    <p className="text-foreground font-medium">4.1 Download Image</p>
                    <ul className="mt-1 list-inside list-disc space-y-1">
                      <li>
                        Go to <strong>Web Interactions</strong> &rarr; <strong>HTTP Request</strong>
                      </li>
                      <li>
                        Request method: <strong>GET</strong>
                      </li>
                      <li>Paste the URL below:</li>
                    </ul>
                    <CopyUrlButton url={apiUrl} />
                    <ul className="list-inside list-disc space-y-1">
                      <li>
                        Enable: <strong>Block next actions until complete</strong>
                      </li>
                      <li>
                        Response: Tick <strong>Save HTTP response to file</strong>
                      </li>
                      <li>
                        Folder &amp; filename: <code>/Download/life.png</code>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">4.2 Set Wallpaper</p>
                    <ul className="mt-1 list-inside list-disc space-y-1">
                      <li>
                        Go to <strong>Device Settings</strong> &rarr; <strong>Set Wallpaper</strong>
                      </li>
                      <li>
                        <strong>Choose Image and Screen</strong>
                      </li>
                      <li>
                        Enter folder &amp; filename: <code>/Download/life.png</code>
                      </li>
                    </ul>
                  </div>
                  <ImportantBox>
                    Use the exact same folder and filename in both actions.
                  </ImportantBox>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <StepBadge number={5} />
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground font-semibold">Finalize</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Give the macro a name &rarr; Tap <strong>Create Macro</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl p-4">
            <h4 className="text-foreground mb-2 font-semibold">Testing</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                <strong>Test:</strong> MacroDroid &rarr; Macros &rarr; select your macro &rarr; More
                options &rarr; Test macro
              </li>
              <li>
                <strong>Stop:</strong> Toggle off or delete the macro
              </li>
              <li>
                <strong>Edit URL:</strong> Tap the HTTP Request action &rarr; Update the URL &rarr;
                Save
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

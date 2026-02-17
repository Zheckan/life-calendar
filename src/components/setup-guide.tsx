"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertTriangle } from "lucide-react";

interface SetupGuideProps {
  apiUrl: string;
}

function StepBadge({ number }: { number: number }): React.ReactElement {
  return (
    <span className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
      {number}
    </span>
  );
}

function CopyUrlButton({ url }: { url: string }): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  return (
    <div className="my-3 flex items-center gap-2">
      <code className="bg-muted text-foreground flex-1 overflow-x-auto rounded-md px-3 py-2 font-mono text-xs">
        {url}
      </code>
      <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

function ImportantBox({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="my-3 flex gap-3 rounded-md border border-amber-500/50 bg-amber-500/10 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <div className="text-foreground text-sm">{children}</div>
    </div>
  );
}

export function SetupGuide({ apiUrl }: SetupGuideProps): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="iphone">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="iphone">iPhone</TabsTrigger>
            <TabsTrigger value="android">Android</TabsTrigger>
          </TabsList>

          <TabsContent value="iphone" className="mt-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <StepBadge number={1} />
                <div>
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
                <div>
                  <h3 className="text-foreground font-semibold">Create Automation</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Open <strong>Shortcuts</strong> app &rarr; Go to <strong>Automation</strong> tab
                    &rarr; <strong>New Automation</strong> &rarr; <strong>Time of Day</strong>{" "}
                    &rarr; <strong>6:00 AM</strong> &rarr; Repeat <strong>&quot;Daily&quot;</strong>{" "}
                    &rarr; Select <strong>&quot;Run Immediately&quot;</strong> &rarr;{" "}
                    <strong>&quot;Create New Shortcut&quot;</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <StepBadge number={3} />
                <div>
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
                      <strong>&quot;Show Preview&quot;</strong>. This prevents iOS from cropping and
                      asking for confirmation each time.
                    </ImportantBox>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="android" className="mt-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <StepBadge number={1} />
                <div>
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
                <div>
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
                <div>
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
                <div>
                  <h3 className="text-foreground font-semibold">Configure Actions</h3>
                  <div className="text-muted-foreground mt-2 space-y-4 text-sm">
                    <div>
                      <p className="text-foreground font-medium">4.1 Download Image</p>
                      <ul className="mt-1 list-inside list-disc space-y-1">
                        <li>
                          Go to <strong>Web Interactions</strong> &rarr;{" "}
                          <strong>HTTP Request</strong>
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
                          Go to <strong>Device Settings</strong> &rarr;{" "}
                          <strong>Set Wallpaper</strong>
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
                <div>
                  <h3 className="text-foreground font-semibold">Finalize</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Give the macro a name &rarr; Tap <strong>Create Macro</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-md p-4">
              <h4 className="text-foreground mb-2 font-semibold">Testing</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>
                  <strong>Test:</strong> MacroDroid &rarr; Macros &rarr; select your macro &rarr;
                  More options &rarr; Test macro
                </li>
                <li>
                  <strong>Stop:</strong> Toggle off or delete the macro
                </li>
                <li>
                  <strong>Edit URL:</strong> Tap the HTTP Request action &rarr; Update the URL
                  &rarr; Save
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

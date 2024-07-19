"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<WebsiteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const crousalArray = [
    "https://assets.mediamodifier.com/mockups/5eb298d9344e64249900dbbc/instagram-post-mockup-maker.jpg",
    "https://img.freepik.com/free-psd/social-media-instagram-post-template_47618-73.jpg?size=338&ext=jpg&ga=GA1.1.2008272138.1713571200&semt=ais",
    "https://i.pinimg.com/736x/2b/1c/35/2b1c357a454e0160af378c3e361693aa.jpg",
  ];

  const handleSubmit = async (event: FormEvent) => {
    setIsLoading(true);
    event.preventDefault();
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setData(data?.data);
      window.scrollTo({ top: 500, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to analyze page:", error);
    }
    setIsLoading(false);
  };

  interface FontDetails {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  }

  interface Link {
    href: string;
    text: string;
  }

  interface WebsiteData {
    title: string;
    description: string;
    keywords: string | null;
    primaryColor: string;
    secondaryColor: string;
    fontDetails: FontDetails;
    headerText: string[];
    links: Link[];
    images: string[];
    mainContentText: string;
    buttonColors: string[];
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Your Brand URL</CardTitle>
          <form onSubmit={handleSubmit}>
            <Input
              placeholder="your url"
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                variant="default"
                className="w-full rounded m-6"
                disabled={isLoading}
              >
                Submit
              </Button>
            </div>
          </form>
        </CardHeader>

        <CardFooter>
          <small>please input text so that we can analyize you branding</small>
        </CardFooter>
      </Card>

      {data && <p>{JSON.stringify(data)}</p>}
    </main>
  );
}

"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
    async function handleSubmit(formData: FormData) {
        // Mock server action for now
        // "use server";
        // console.log("Form submitted", formData);
        alert("Thank you for your message! We will get back to you soon.");
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            <Navbar />

            <main className="flex-1 py-12 md:py-20">
                <div className="container px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Get in touch</h1>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    Have a question about our mock tests or need academic guidance? Our team of student mentors is here to help.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Email Us</h3>
                                        <p className="text-slate-500 text-sm mb-1">For general queries and support</p>
                                        <a href="mailto:support@duseva.com" className="text-blue-600 font-medium hover:underline">support@duseva.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600 shrink-0">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Call Us</h3>
                                        <p className="text-slate-500 text-sm mb-1">Available Mon-Fri, 10am - 6pm</p>
                                        <a href="tel:+919876543210" className="text-slate-900 font-medium hover:text-blue-600">+91 98765 43210</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 shrink-0">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Visit Us</h3>
                                        <p className="text-slate-500 text-sm">North Campus, University of Delhi<br />New Delhi, India 110007</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-lg">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
                            <form action={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-slate-700">Name</label>
                                        <Input id="name" name="name" placeholder="John Doe" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone</label>
                                        <Input id="phone" name="phone" placeholder="+91..." type="tel" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                                    <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-slate-700">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="How can we help you?"
                                        required
                                    />
                                </div>

                                <Button type="submit" size="lg" className="w-full font-bold shadow-md">
                                    Send Message <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

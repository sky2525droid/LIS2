import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

const WorkflowGallery: React.FC = () => {
    const [images, setImages] = useState<{ title: string, url: string, description: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const workflowSteps = [
        {
            title: "1. تسجيل المريض",
            prompt: "A realistic high-quality photo of a modern medical laboratory reception desk, a friendly receptionist talking to a patient, clean clinical environment, soft lighting, professional atmosphere.",
            description: "مرحلة استقبال المريض وتسجيل بياناته الشخصية في النظام."
        },
        {
            title: "2. سحب العينات",
            prompt: "A realistic close-up photo of a medical professional in a lab coat and gloves collecting a blood sample from a patient's arm, sterile environment, medical equipment visible, professional lighting.",
            description: "عملية سحب العينات وتجهيزها للفحص المخبري."
        },
        {
            title: "3. إدخال النتائج وضبط الجودة",
            prompt: "A realistic photo of a laboratory scientist in a white coat looking at a computer monitor displaying complex medical data and charts, laboratory equipment in the background, focused professional atmosphere.",
            description: "مرحلة إدخال القيم المخبرية وتدقيقها من قبل الطبيب المسؤول."
        },
        {
            title: "4. إصدار التقارير النهائية",
            prompt: "A realistic photo of a professional medical laboratory report with a logo, held by a doctor's hand, clear text and tables, clinical background, high quality paper.",
            description: "طباعة التقرير النهائي أو إرساله للمريض عبر واتساب."
        },
        {
            title: "5. الإحصائيات والتقارير المالية",
            prompt: "A realistic photo of a large digital screen in a modern office showing colorful financial charts and medical statistics, professional business environment, clean design.",
            description: "متابعة أداء المختبر المالي والإحصائي عبر لوحة تحكم ذكية."
        }
    ];

    useEffect(() => {
        const generateWorkflowImages = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const generatedImages = [];

                for (const step of workflowSteps) {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: { parts: [{ text: step.prompt }] },
                        config: { imageConfig: { aspectRatio: "16:9" } }
                    });

                    let imageUrl = "";
                    for (const part of response.candidates?.[0]?.content?.parts || []) {
                        if (part.inlineData) {
                            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                            break;
                        }
                    }

                    if (imageUrl) {
                        generatedImages.push({
                            title: step.title,
                            url: imageUrl,
                            description: step.description
                        });
                    }
                }

                setImages(generatedImages);
                setLoading(false);
            } catch (err) {
                console.error("Error generating images:", err);
                setError("حدث خطأ أثناء توليد الصور الواقعية. يرجى المحاولة مرة أخرى.");
                setLoading(false);
            }
        };

        generateWorkflowImages();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                <p className="text-gray-600 font-bold animate-pulse">جاري توليد صور واقعية لسير العمل... يرجى الانتظار</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-bold">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 py-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-gray-800">صور واقعية لسير العمل (Workflow)</h2>
                <p className="text-gray-500 font-bold">تم توليد هذه الصور بواسطة الذكاء الاصطناعي لتمثيل مراحل العمل في المختبر</p>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {images.map((img, index) => (
                    <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transform transition-all hover:scale-[1.01]">
                        <div className="aspect-video w-full overflow-hidden bg-gray-100">
                            <img 
                                src={img.url} 
                                alt={img.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <div className="p-6 space-y-2">
                            <h3 className="text-xl font-black text-teal-700">{img.title}</h3>
                            <p className="text-gray-600 font-bold leading-relaxed">{img.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkflowGallery;

import { useForm } from "react-hook-form";

interface VoidDocProps {
    docId: number;
    onClose: () => void;
}

interface FormDataProps {
    voidRemark: string;
}

export default function VoidDoc({ docId, onClose }: VoidDocProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormDataProps>();

    const onSubmit = async (data: FormDataProps) => {
        try {
            // console.log("Submitting voidRemark:", data.voidRemark);
            // const formData = new FormData();
            // formData.append("voidRemark", data.voidRemark);
            

            const response = await fetch(
                `https://csce482capstone.csce482capstone.me/api/documents/void`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json", 
                    },
                    body: JSON.stringify({
                        Remark: data.voidRemark,
                        DocumentId: docId,
                        PersonId: "1"
                    }),
                }
            );

            if (response.ok) {
                console.log("Form submitted successfully");
                onClose();
            } else {
                console.error("Error submitting form");
            }
        } catch (e) {
            console.error("Submission error:", e);
        }
    };

    return (
        <div className="bg-white h-screen flex flex-col p-6">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white flex flex-col space-y-4"
            >
                <label htmlFor="voidRemark" className="text-lg font-medium">
                    Void Remarks
                </label>
                <textarea
                    id="voidRemark"
                    data-testid="voidRemark"
                    placeholder="Type remarks here"
                    {...register("voidRemark", {
                        required: "Void remark is required.",
                        minLength: {
                            value: 50,
                            message: "Void remark must be at least 50 characters long.",
                        },
                    })}
                    className="w-full h-40 p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aggie-maroon focus:border-aggie-maroon resize-none"
                ></textarea>
                {errors.voidRemark && (
                    <p className="text-red-500">{errors.voidRemark.message}</p>
                )}

                <button
                    className="mt-4 px-4 py-2 bg-aggie-maroon text-white rounded-md border-2 border-aggie-maroon hover:bg-white hover:text-aggie-maroon transition-colors"
                    type="submit"
                >
                    Void
                </button>
            </form>
        </div>

    );
}

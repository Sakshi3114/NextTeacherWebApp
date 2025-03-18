import ImageSlider from "@/components/common/Slider";

export default function Home() {
  return (
      <div>
        <h1 className='text-3xl font-bold text-center mt-4 mb-4'>Home page</h1>
        <ImageSlider />
        <div className="mt-6 px-6 w-full text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Welcome to Teacher Schedule Check!</h2>
        <p className="text-gray-600 mt-2">
          This platform allows <b>teachers and students</b> to easily check and manage their schedules.
          <br/>
          Navigate to the <b>Admin Panel</b> to update schedules or visit the <b>Student Panel</b> to check teacher schedule.
        </p>
      </div>
      </div>
  );
}

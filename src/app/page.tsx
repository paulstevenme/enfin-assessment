import MainLayout from '@/layouts/MainLayout/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <section className="p-8 flex flex-col h-full justify-center">
        <h1 className="text-3xl font-bold font-poppins">Meeting Scheduler ⚡</h1>
      </section>
    </MainLayout>
  );
}

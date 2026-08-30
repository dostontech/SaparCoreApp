export default function SectionTitle({ title, description }) {
    return (
        <div className='mt-8 sm:mt-12 flex flex-col items-center justify-center'>
            <h3 className='text-center text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900'>{title}</h3>
            <p className='mt-3 max-w-xs text-center text-sm sm:text-base text-slate-600 md:max-w-lg leading-relaxed'>{description}</p>
        </div>
    );
}

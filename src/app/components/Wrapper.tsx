
interface WrapperProps{
    label: string,
    disabled: boolean,
    className: string,
    children: React.ReactNode
}

export default function Wrapper({label, disabled, className, children}: WrapperProps) {
    const vars = `mx-4 relative grid bg-white ${disabled? "bg-gray-300": ""} ${className}`;
    return (
      <div className={vars} >
          <div className={`absolute top-0 left-8 m-0 px-1 bg-white font-bold ${disabled? "text-fadded-aggie-maroon": "text-aggie-maroon"}`}>{label}</div>
          <div className={`border-4 rounded-xl flex m-3 p-2 ${disabled? "border-fadded-aggie-maroon": "border-aggie-maroon"}`} >
              {children}
          </div>
      </div>
    );
  }
  
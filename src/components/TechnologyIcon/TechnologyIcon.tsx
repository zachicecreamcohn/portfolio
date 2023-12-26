import React, {useCallback} from 'react';
import styles from "./TechnologyIcon.module.css";
import _ from "lodash";

interface TechnologyIconProps {
    children: React.ReactNode;
    setSelectedProficiency?: React.Dispatch<React.SetStateAction<string>>;
    labelText: string;
    spacer?: boolean;
}
export default function TechnologyIcon({ children, spacer, setSelectedProficiency, labelText }: TechnologyIconProps) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetProficiency = useCallback(_.debounce((labelText: React.SetStateAction<string>) => {
        setSelectedProficiency && setSelectedProficiency(labelText);
    }, 100), []); // 300ms debounce time

    return (
        <div className={styles.container + (spacer ? " " + styles.spacer : "")}>
            <div className={styles.icon}
                 onMouseOver={() => debouncedSetProficiency(labelText)}
                 onMouseOut={() => debouncedSetProficiency("")}>
                {children}
            </div>
        </div>
    );
}
export type BoxPosition = {
    x: number;
    y?: number;
    z: number;
};

export type BoxProps = {
    position: BoxPosition;
    color?: number;
    height?: number;
};

export default function Box(props: BoxProps) {
    void props;
    return null;
}

Box.displayName = "Box";
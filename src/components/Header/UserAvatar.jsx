import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";

const UserAvatar = () => {
    return (
        <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    );
};

export default UserAvatar; 
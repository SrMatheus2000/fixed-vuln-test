(name, current) => {
        const Info = CurrentInfo;
        const link = Info.link;
        const PREFIX = CloudCmd.PREFIX;
        const dir = PREFIX + FS + Info.dirPath;
        
        link.title      = name;
        link.innerHTML  = encode(name);
        link.href       = dir + name;
        
        current.setAttribute('data-name', 'js-file-' + name);
        
        return link;
    }
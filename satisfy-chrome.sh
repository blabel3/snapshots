cd  node_modules/puppeteer/.local-chromium/*/chrome-linux

ls

ldd chrome | grep not

#Installs everything that aws-main has a package for 
sudo yum -y install cups-libs dbus-glib libXrandr libXcursor libXinerama cairo cairo-gobject pango alsa-lib  libXcomposite libXi libXtst 

# Install ATK from CentOS 7
sudo rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/atk-2.22.0-3.el7.x86_64.rpm
sudo rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/at-spi2-atk-2.22.0-2.el7.x86_64.rpm
sudo rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/at-spi2-core-2.22.0-1.el7.x86_64.rpm

# Install GTK from fedora 20
sudo rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/g/GConf2-3.2.6-7.fc20.x86_64.rpm
sudo rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libXScrnSaver-1.2.2-6.fc20.x86_64.rpm
sudo rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libxkbcommon-0.3.1-1.fc20.x86_64.rpm
sudo rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libwayland-client-1.2.0-3.fc20.x86_64.rpm
sudo rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/l/libwayland-cursor-1.2.0-3.fc20.x86_64.rpm
sudo rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/20/Fedora/x86_64/os/Packages/g/gtk3-3.10.4-1.fc20.x86_64.rpm

# Install Gdk-Pixbuf from fedora 16
sudo rpm -ivh --nodeps http://dl.fedoraproject.org/pub/archive/fedora/linux/releases/16/Fedora/x86_64/os/Packages/gdk-pixbuf2-2.24.0-1.fc16.x86_64.rpm

# sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libXss1-32bit-1.2.3-1.2.ppc64.rpm
# sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libatk-1_0-0-32bit-2.32.0-1.1.ppc64.rpm
# sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libatk-bridge-2_0-0-32bit-2.32.0-1.1.ppc64.rpm
# sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libatspi0-32bit-2.32.1-1.1.ppc64.rpm
# sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libgtk-3-0-32bit-3.24.8-3.1.ppc64.rpm
# sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libgdk_pixbuf-2_0-0-32bit-2.38.1-2.1.ppc64.rpm

ldd chrome | grep not

uname -a
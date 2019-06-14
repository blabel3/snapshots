cd  node_modules/puppeteer/.local-chromium/*/chrome-linux

ls

ldd chrome | grep not

#Installs everything that aws-main has a package for 
sudo yum -y install cups-libs dbus-glib libXrandr libXcursor libXinerama cairo cairo-gobject pango alsa-lib  libXcomposite libXi libXtst 

sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libXss1-32bit-1.2.3-1.2.ppc64.rpm
sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libatk-1_0-0-32bit-2.32.0-1.1.ppc64.rpm
sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libatk-bridge-2_0-0-32bit-2.32.0-1.1.ppc64.rpm
sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libatspi0-32bit-2.32.1-1.1.ppc64.rpm
sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libgtk-3-0-32bit-3.24.8-3.1.ppc64.rpm
sudo rpm -iv --nodeps https://rpmfind.net/linux/opensuse/ports/ppc/tumbleweed/repo/oss/ppc64/libgdk_pixbuf-2_0-0-32bit-2.38.1-2.1.ppc64.rpm

ldd chrome | grep not

uname -a
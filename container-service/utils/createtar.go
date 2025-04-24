package utils

import (
	"archive/tar"
	"io"
	"os"
	"path/filepath"
)

func CreateTarArchive(dir string, buf io.Writer) error {
	tw := tar.NewWriter(buf)
	defer tw.Close()

	return filepath.Walk(dir, func(file string, fi os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		header, err := tar.FileInfoHeader(fi, file)
		if err != nil {
			return err
		}

		// Use Name relative to dir
		header.Name, err = filepath.Rel(dir, file)
		if err != nil {
			return err
		}
		if header.Name == "." {
			return nil
		}

		if err := tw.WriteHeader(header); err != nil {
			return err
		}

		if !fi.Mode().IsRegular() {
			return nil
		}

		f, err := os.Open(file)
		if err != nil {
			return err
		}
		defer f.Close()

		_, err = io.Copy(tw, f)
		if err != nil {
			return err
		}
		return nil
	})
}
